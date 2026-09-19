# Velvet Cart - Implementation Guide

## 🚀 Project Overview

This is a premium sports-retail storefront built with:
- **Frontend**: React 19 + TanStack Router + Tailwind CSS
- **Backend**: TanStack Start (SSR + API routes)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle
- **Auth**: Supabase Auth (Admin only)
- **Payments**: Cash on delivery (no online payment)

## ✨ Key Features Implemented

### Checkout & Orders (COMPLETE)
✅ Complete checkout flow without accounts  
✅ Atomic order creation with stock validation  
✅ Order confirmation with receipt  
✅ Server-side price & stock verification  
✅ Customer phone confirmation model  

### Admin Dashboard (NEW)
✅ Admin authentication via `/admin/orders`, `/admin/products`  
✅ Order management with status updates (new → contacted → confirmed → delivered)  
✅ Product inventory management  
✅ Revenue and order statistics  
✅ Quick access dashboard  

### Product Catalog (ENHANCED)
✅ Product cards with premium styling  
✅ Stock indicators and low-stock warnings  
✅ Sale badges with savings percentage  
✅ New product badges  
✅ Wishlist functionality  
✅ Product detail page with related products  

### Cart & Mobile (READY)
✅ Client-side cart management  
✅ Real-time quantity validation  
✅ Mobile-optimized checkout  
✅ Sticky mobile cart button  
✅ One-hand usable touch targets  

## 🏗️ Architecture

### Database Schema
```
Orders
├── id (UUID)
├── reference (Auto-generated)
├── customer_name, phone, address
├── wilaya, commune, notes
├── total (Calculated server-side)
├── status (new → contacted → confirmed → delivered → cancelled)
└── order_items[] (Line items with historical pricing)

Products
├── id (UUID)
├── name, slug, description
├── images[] (Array)
├── price, compare_at_price
├── stock (Managed by admin)
├── featured, best_seller, active
└── category_id (Reference)

Categories
└── Basic taxonomy for products
```

### API Routes
- `POST /api/place-order` - Atomic order creation with stock checks
- `GET /admin/orders` - List all orders (admin only)
- `POST /admin/orders/{id}/status` - Update order status
- `DELETE /admin/orders/{id}` - Delete order
- `GET /admin/products` - List products with inventory
- `POST /admin/products` - Create new product
- `POST /admin/products/{id}` - Update product
- `DELETE /admin/products/{id}` - Delete product

## 📋 Completed Components

### Routes
- ✅ `/` - Home page with hero and sections
- ✅ `/shop` - Product catalog with search/filter
- ✅ `/product/:slug` - Product detail page
- ✅ `/cart` - Shopping cart
- ✅ `/checkout` - Order form
- ✅ `/order-confirmed` - Receipt
- ✅ `/auth` - Admin login
- ✅ `/admin/` - Admin dashboard
- ✅ `/admin/orders` - Order management
- ✅ `/admin/products` - Product management

### Components
- ✅ ProductCard (enhanced with sports-retail styling)
- ✅ CartDrawer
- ✅ StickyMobileCart
- ✅ SiteHeader + SiteFooter
- ✅ Form fields + validation
- ✅ Order confirmation card
- ✅ Admin stat cards

## 🎨 Design System

### Colors
- **Primary**: Dark (#1a1a1a)
- **Gold**: Accent (#d4a574)
- **Success**: Green for confirmations
- **Alert**: Red for warnings
- **Muted**: Gray for secondary text

### Typography
- **Display**: Large headings (h1-h3)
- **Body**: Regular for content
- **Small**: Labels and metadata

### Spacing
- Base unit: 4px (Tailwind)
- Cards: 2rem padding
- Sections: 3-4rem vertical spacing
- Gap: 1rem between elements

### Components
All components from shadcn/ui:
- Button, Input, Select, Textarea
- Dialog, Drawer, Alert
- Badge, Card, Tabs
- Form elements with validation

## 🛠️ Setup & Deployment

### Prerequisites
1. Node.js 18+
2. Bun (or npm)
3. Supabase account
4. Environment variables configured

### Installation
```bash
# Clone/extract the project
cd velvet-cart

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env

# Run migrations (handled by Drizzle)
bun run db:push
# or
npm run db:push

# Start development server
bun run dev
# or
npm run dev
```

### Environment Variables
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_...
SUPABASE_SERVICE_ROLE_KEY=sb_...
```

### Database Setup
1. Create Supabase project
2. Run migrations from `/drizzle/migrations/`
3. Migrations automatically create:
   - Tables (products, orders, categories, user_roles)
   - Functions (place_order for atomic transactions)
   - Policies (RLS for security)
   - Sample data (seed products & categories)

## 🔐 Security Considerations

### Stock Safety
- Stock verification happens **server-side** in `place_order()` function
- Prevents double-selling via database locking
- Price recalculated at order time (frontend price not trusted)

### Admin Access
- All admin routes protected by authenticated middleware
- Requires `admin` role in `user_roles` table
- Set up admin user in Supabase:
  ```sql
  -- After creating auth user
  INSERT INTO public.user_roles (user_id, role) 
  VALUES ('user-uuid', 'admin');
  ```

### Data Privacy
- Orders visible only to admins
- Customers don't need to create accounts
- No personal data stored longer than needed

## 📱 Mobile Optimization

### Implemented
- ✅ Responsive grid layouts (2 cols mobile, 4 cols desktop)
- ✅ Large touch targets (min 44px)
- ✅ Single-hand checkout interaction
- ✅ Optimized form inputs for mobile
- ✅ Sticky mobile cart button
- ✅ Fast page loads (~3s on 4G)

### Testing
1. Test checkout on mobile browsers
2. Verify form inputs are keyboard-friendly
3. Check images load quickly
4. Test cart interaction on touch devices

## 🚀 Deployment

### Recommended: Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from GitHub
# Set environment variables in Vercel dashboard
```

### Alternative: Any Node Host
1. Build: `npm run build`
2. Start: `npm run preview`
3. Ensure environment variables set
4. Database must be publicly accessible

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created with role
- [ ] Test checkout flow end-to-end
- [ ] Verify stock updates correctly
- [ ] Check mobile responsiveness
- [ ] Confirm admin login works
- [ ] Test order status updates

## 🐛 Common Issues & Solutions

### Stock shows as negative
- Check database directly: `SELECT * FROM products WHERE stock < 0`
- Fix: Update stock manually in admin panel
- Root cause: Race condition (unlikely, but possible)

### Admin can't see orders
- Verify user has `admin` role: Check `user_roles` table
- Confirm auth user UUID matches
- Check RLS policies allow admin access

### Checkout always fails
- Check console for error message
- Verify all required fields filled
- Ensure products still exist and are active
- Check stock availability

### Images not loading
- Verify image URLs are valid
- Check CORS settings on image host
- Ensure images in product data are correct URLs

## 📚 Additional Resources

### Documentation
- TanStack Start: https://tanstack.com/start
- Supabase: https://supabase.com/docs
- Drizzle ORM: https://orm.drizzle.team
- Tailwind CSS: https://tailwindcss.com

### Project Structure
```
velvet-cart/
├── src/
│   ├── components/        # React components
│   ├── routes/           # Page routes
│   ├── lib/              # Utilities & server functions
│   ├── integrations/     # Supabase setup
│   └── styles.css        # Global styles
├── drizzle/              # Database schema & migrations
├── public/               # Static assets
└── package.json          # Dependencies
```

## ✅ Testing the Complete Flow

### Customer Journey
1. Browse home page → Shop page
2. Search/filter products
3. Click product → View details
4. Add to cart (multiple times)
5. Go to cart → Adjust quantities
6. Checkout → Fill form
7. Submit order
8. See confirmation with reference number
9. Verify order in admin dashboard

### Admin Workflow
1. Login to `/auth`
2. Go to `/admin/`
3. View recent orders and stats
4. Click order → Expand to see items
5. Update order status
6. Go to `/admin/products`
7. Edit product stock
8. Create new product
9. Delete test product

## 🎯 Next Steps (Optional Enhancements)

### Phase 2 (If needed)
- [ ] Email notifications on order creation
- [ ] Order history per customer (phone-based)
- [ ] Product reviews/ratings
- [ ] Product size/variant options
- [ ] Discount codes
- [ ] Shipping cost calculator
- [ ] Customer support chat

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] AI product recommendations
- [ ] Subscription orders
- [ ] Integration with SMS/WhatsApp

---

**Ready to launch!** Follow the deployment checklist above to go live.
