-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12,2),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon USING (active = true);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS
CREATE TYPE public.order_status AS ENUM ('new','contacted','confirmed','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  wilaya text NOT NULL,
  commune text NOT NULL,
  notes text,
  total numeric(12,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders admin read" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin delete" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_purchase numeric(12,2) NOT NULL
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items admin read" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ATOMIC ORDER PLACEMENT
CREATE OR REPLACE FUNCTION public.place_order(
  _customer_name text,
  _phone text,
  _address text,
  _wilaya text,
  _commune text,
  _notes text,
  _items jsonb
) RETURNS TABLE (order_id uuid, reference text, total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  item jsonb;
  prod public.products;
  qty integer;
  computed_total numeric(12,2) := 0;
  new_order public.orders;
BEGIN
  IF _customer_name IS NULL OR length(btrim(_customer_name)) < 2 THEN RAISE EXCEPTION 'INVALID_NAME'; END IF;
  IF _phone IS NULL OR length(btrim(_phone)) < 8 THEN RAISE EXCEPTION 'INVALID_PHONE'; END IF;
  IF _address IS NULL OR length(btrim(_address)) < 4 THEN RAISE EXCEPTION 'INVALID_ADDRESS'; END IF;
  IF _wilaya IS NULL OR length(btrim(_wilaya)) < 2 THEN RAISE EXCEPTION 'INVALID_WILAYA'; END IF;
  IF _commune IS NULL OR length(btrim(_commune)) < 2 THEN RAISE EXCEPTION 'INVALID_COMMUNE'; END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'EMPTY_CART'; END IF;
  IF jsonb_array_length(_items) > 50 THEN RAISE EXCEPTION 'TOO_MANY_ITEMS'; END IF;

  INSERT INTO public.orders (customer_name, phone, address, wilaya, commune, notes, total)
  VALUES (btrim(_customer_name), btrim(_phone), btrim(_address), btrim(_wilaya), btrim(_commune), nullif(btrim(coalesce(_notes,'')),''), 0)
  RETURNING * INTO new_order;

  FOR item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    qty := (item->>'quantity')::int;
    IF qty IS NULL OR qty < 1 OR qty > 99 THEN RAISE EXCEPTION 'INVALID_QUANTITY'; END IF;

    SELECT * INTO prod FROM public.products
      WHERE id = (item->>'product_id')::uuid AND active = true FOR UPDATE;
    IF prod.id IS NULL THEN RAISE EXCEPTION 'PRODUCT_UNAVAILABLE'; END IF;
    IF prod.stock < qty THEN RAISE EXCEPTION 'OUT_OF_STOCK:%', prod.name; END IF;

    UPDATE public.products SET stock = stock - qty WHERE id = prod.id;

    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price_at_purchase)
    VALUES (new_order.id, prod.id, prod.name, qty, prod.price);

    computed_total := computed_total + (prod.price * qty);
  END LOOP;

  UPDATE public.orders SET total = computed_total WHERE id = new_order.id;

  RETURN QUERY SELECT new_order.id, new_order.reference, computed_total;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,text,text,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,jsonb) TO anon, authenticated, service_role;

-- SEED
INSERT INTO public.categories (name, slug, image) VALUES
 ('Watches','watches','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
 ('Fragrances','fragrances','https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'),
 ('Leather Goods','leather-goods','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'),
 ('Audio','audio','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');

INSERT INTO public.products (name, slug, description, images, category_id, price, compare_at_price, stock, featured, best_seller)
SELECT v.name, v.slug, v.description, v.images, c.id, v.price, v.compare_at_price, v.stock, v.featured, v.best_seller
FROM (VALUES
 ('Onyx Chronograph','onyx-chronograph','A precision chronograph with a brushed steel case, sapphire crystal glass and a soft calf-leather strap. Water resistant to 50m.', ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&q=80','https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1200&q=80'],'watches',28900::numeric,34900::numeric,7,true,true),
 ('Gold Minimal 38','gold-minimal-38','Slim 38mm gold-tone dress watch with a domed dial and mesh bracelet. Understated, everyday elegance.', ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1200&q=80','https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1200&q=80'],'watches',19900::numeric,NULL,2,true,false),
 ('Amber Oud Parfum','amber-oud-parfum','Warm amber, oud and vanilla in a 50ml extrait concentration. Long-lasting, unisex signature scent.', ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=80','https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=80'],'fragrances',12500::numeric,15000::numeric,18,true,true),
 ('Noir Intense 100ml','noir-intense-100ml','A smoky blend of black pepper, leather and cedar. Bold evening fragrance in a heavy glass flacon.', ARRAY['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&q=80'],'fragrances',9900::numeric,NULL,24,false,true),
 ('Heritage Leather Wallet','heritage-leather-wallet','Full-grain vegetable-tanned leather, eight card slots and a hand-stitched spine that ages beautifully.', ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80','https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1200&q=80'],'leather-goods',6900::numeric,8900::numeric,31,true,false),
 ('Weekender Duffle','weekender-duffle','Structured 40L duffle in pebbled leather with a canvas lining, brass hardware and detachable strap.', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80'],'leather-goods',34900::numeric,NULL,4,false,true),
 ('Studio Wireless Headphones','studio-wireless-headphones','Over-ear active noise cancelling, 40h battery and memory-foam cushions wrapped in vegan leather.', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80'],'audio',24900::numeric,29900::numeric,12,true,true),
 ('Pebble Bluetooth Speaker','pebble-bluetooth-speaker','Pocket-size speaker with surprising low end, IPX7 water resistance and 18 hours of playback.', ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=80'],'audio',7900::numeric,NULL,1,false,false)
) AS v(name,slug,description,images,cat,price,compare_at_price,stock,featured,best_seller)
JOIN public.categories c ON c.slug = v.cat;