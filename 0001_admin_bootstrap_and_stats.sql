-- First authenticated user can claim owner/admin access when no admin exists yet.
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated, service_role;

-- Sales statistics for the owner dashboard.
CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  SELECT jsonb_build_object(
    'orders_total', (SELECT count(*) FROM public.orders),
    'orders_new', (SELECT count(*) FROM public.orders WHERE status = 'new'),
    'revenue_delivered', (SELECT coalesce(sum(total),0) FROM public.orders WHERE status = 'delivered'),
    'revenue_pipeline', (SELECT coalesce(sum(total),0) FROM public.orders WHERE status IN ('new','contacted','confirmed')),
    'products_total', (SELECT count(*) FROM public.products),
    'low_stock', (SELECT count(*) FROM public.products WHERE active AND stock <= 3),
    'daily', (SELECT coalesce(jsonb_agg(d ORDER BY d->>'day'),'[]'::jsonb) FROM (
        SELECT jsonb_build_object('day', to_char(date_trunc('day', created_at),'MM-DD'), 'orders', count(*), 'revenue', coalesce(sum(total),0)) AS d
        FROM public.orders WHERE created_at > now() - interval '14 days'
        GROUP BY date_trunc('day', created_at)
      ) s),
    'top_products', (SELECT coalesce(jsonb_agg(t),'[]'::jsonb) FROM (
        SELECT jsonb_build_object('name', product_name, 'qty', sum(quantity), 'revenue', sum(quantity*price_at_purchase)) AS t
        FROM public.order_items GROUP BY product_name ORDER BY sum(quantity) DESC LIMIT 5
      ) p)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated, service_role;

-- Storage policies for product images (public read, admin write).
CREATE POLICY "product images public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "product images admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));