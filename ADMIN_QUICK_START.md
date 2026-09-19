# Admin Dashboard - Quick Start Guide

## 🔑 Admin Login

1. Navigate to `/auth`
2. Sign in with your Supabase auth credentials
3. After login, you'll be redirected to `/admin/`

**Note**: Your user account must have the `admin` role in the `user_roles` table.

### Setting Up Your First Admin User

In Supabase SQL Editor, run:
```sql
-- Get your auth user ID first:
SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Then add the admin role:
INSERT INTO public.user_roles (user_id, role) 
VALUES ('paste-uuid-here', 'admin');
```

---

## 📊 Admin Dashboard Home (`/admin/`)

Shows at-a-glance metrics:
- **New Orders** - Orders with status "new"
- **Revenue** - Total amount of all orders
- **Products** - Total products in catalog
- **Low Stock** - Products with ≤5 items

Quick navigation cards to:
- Orders management
- Products management
- Recent 5 orders list

---

## 📦 Orders Management (`/admin/orders`)

### View Orders
1. Click **Orders** from admin dashboard
2. Filter by status using the dropdown:
   - **All orders** - Everything
   - **New** - Just received, need attention
   - **Contacted** - You've called customer
   - **Confirmed** - Customer confirmed delivery
   - **Delivered** - Order complete
   - **Cancelled** - Order cancelled

### Order Details
1. Click an order row to expand
2. See:
   - Order reference number (use this when calling customer)
   - Customer name & phone number
   - Full delivery address
   - List of ordered items with prices
   - Customer notes (if any)
   - Current order status

### Update Order Status

In expanded order view:
1. Click status buttons at bottom: **New** → **Contacted** → **Confirmed** → **Delivered**
2. Only move forward (can't go back, except to Cancelled)
3. Can **Cancel** order at any time (red button)

**Status Flow**:
```
New (⏰ needs action)
  ↓
Contacted (📞 called customer)
  ↓
Confirmed (✅ customer confirmed)
  ↓
Delivered (🚚 complete)
```

### Delete Order
⚠️ Warning: Cannot be undone!

In expanded order view, click **Trash** button → confirm deletion

---

## 🛍️ Products Management (`/admin/products`)

### View Inventory
1. Click **Products** from admin dashboard
2. See table of all products with:
   - Product name & slug
   - Current price & sale price (if on sale)
   - Current stock level
   - Flags (Featured, Bestseller)

### Stock Status Colors
- 🔴 **Red** - 0 stock (out of stock)
- 🟡 **Yellow** - 1-5 items (low stock)
- 🟢 **Green** - 6+ items (in stock)

### Edit Product
1. Find product in table
2. Click **Edit** (pencil icon)
3. Update:
   - Product name
   - Price
   - Sale price (optional)
   - Stock quantity
   - Featured? (appears on home page)
   - Bestseller? (appears on home page)
4. Click **Update Product**

### Create New Product
1. Click **New Product** button (top right)
2. Fill in:
   - Product name
   - Price
   - Optional: Sale price
   - Stock quantity
   - Optional: Mark as Featured or Bestseller
3. Click **Create Product**

**Note**: New products need images added manually in Supabase editor.

### Delete Product
1. Find product in table
2. Click **Trash** button
3. Confirm deletion
⚠️ **Cannot be undone!**

---

## 📈 Key Metrics & Statistics

### Dashboard Stats
| Metric | What it means |
|--------|---------------|
| New Orders | Orders just received, need follow-up |
| Revenue (All) | Total money from all orders (not considering cost) |
| Products | Total items in catalog |
| Low Stock | Products running out (plan reorders) |

### Order Stats
Each order shows:
- **Reference** - Unique ID to reference when calling
- **Total** - Amount customer will pay on delivery
- **Status** - Current stage of order
- **Date** - When order was placed

---

## 🎯 Daily Workflow Example

### Morning Check-in (9 AM)
1. Go to `/admin/`
2. See **New Orders** count
3. Click **Orders**
4. Filter by **New** status
5. Note down orders to call today

### During Day
1. Expand each new order
2. Note customer name & phone
3. Update status to **Contacted** after calling
4. Note any special instructions from customer
5. Update to **Confirmed** when customer agrees

### Evening
1. Check low stock products
2. Update inventory as items ship
3. Update statuses to **Delivered** once shipped
4. Review revenue for the day

---

## 💡 Pro Tips

### Finding Customers
- Orders are sorted newest first (top = most recent)
- Each order has unique reference number
- Always verify phone number before calling

### Stock Management
- Update stock when new inventory arrives
- Mark as Featured on home page for promotions
- Use Bestseller flag for top sellers
- Remove sale price to stop showing "Sale" badge

### Order Confirmation
- Always call number provided in order
- Use order reference when talking ("Hi, this is about order AB12CD34")
- Confirm address is correct before delivery
- Note any special instructions in order notes

### Cancellations
- Can cancel any order
- Use Cancelled status to mark order as no longer valid
- Reassure customer about payment safety (cash on delivery means no payment taken yet)

---

## ❌ Troubleshooting

### Can't See Orders
- Check if logged in (you should see admin header)
- Verify user has `admin` role
- Try logging out and back in

### Stock Showing Wrong
- Refresh page to get latest data
- Check database directly if persists
- Admin can manually edit stock

### Can't Update Status
- Can only move status forward (or cancel)
- Can't downgrade from Confirmed → Contacted
- Solution: Cancel and create new order if mistake

### Product Not Showing on Site
- Check if "active" is set to true (in database)
- Product needs featured/bestseller tags to appear on homepage
- Wait for page cache to refresh (~5 min)

---

## 🔒 Security Notes

- ✅ Only admins can see orders (customers can't)
- ✅ Stock changes are immediate
- ✅ Order prices locked at purchase time (can't change after)
- ✅ Always verify you're calling the right customer

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify database connection is working
3. Check Supabase project status
4. Review authentication settings

---

**Happy selling! 🎉**
