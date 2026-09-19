# Velvet Cart

Build a modern, premium, mobile-first ecommerce website inspired by the visual style and user experience of Djafer Store, but create an original design rather than copying it directly.

Business Model

This is not a traditional ecommerce website with customer accounts or online payments.

Customers should:

Browse products

Search and filter items

Add products to a cart

Fill out an order form (name, phone number, address, notes)

Submit the order

After submission:

The order is stored in the database

Product stock is updated automatically

The business owner receives the order details

The owner contacts the customer by phone

No customer login, registration, password reset, or customer accounts are needed.

Visual Style

Create a premium, modern, responsive design with:

Clean layout

High-quality product cards

Smooth animations

Elegant hover effects

Rounded corners

Soft shadows

Mobile-first design

Fast loading

Professional typography

Beautiful spacing

Use a modern color system:

Primary color: deep black / dark gray

Accent color: warm orange or gold

Neutral backgrounds

Strong contrast

Animations:

Smooth page transitions

Cart slide-in animation

Product image hover zoom

Fade-in sections

Loading skeletons

Pages

Home Page

Include:

Hero section

Featured products

Categories

Best sellers

Promotional banners

Customer trust section

Contact information

Shop Page

Include:

Product grid

Search bar

Filters

Sorting

Category navigation

Product Page

Include:

Large image gallery

Product information

Price

Available stock

Quantity selector

Add to cart button

Related products

Cart

Include:

Product list

Quantity updates

Automatic total calculation

Remove items

Stock validation

Checkout / Order Form

Fields:

Full name

Phone number

Address

Wilaya

Commune

Optional notes

Show:

Order summary

Total price

Success confirmation

Database Structure

Products:

id

name

description

images

category

price

stock

active

Orders:

id

customer_name

phone

address

wilaya

commune

notes

total

status

created_at

Order Items:

id

order_id

product_id

quantity

price_at_purchase

Categories:

id

name

image

Stock Logic

The database must always be the source of truth.

Order process:

Customer submits order

Backend validates products

Backend checks stock

Backend calculates final total

Stock is decreased atomically

Order is saved

Owner receives notification

Prevent overselling:

If stock = 1:

Customer A buys → success

Customer B buys → out of stock

Never trust prices, totals, or stock values sent from the frontend.

Admin Dashboard (Owner Only)

Create a secure private admin panel with:

Login

Product management

Stock management

Order management

Change order status

Add/edit/delete products

Upload images

Sales statistics

Order statuses:

New

Contacted

Confirmed

Delivered

Cancelled

Technical Stack

Use:

React

TypeScript

TailwindCSS

Supabase

Implement:

Row Level Security

Secure API calls

Server-side validation

Optimized images

Responsive design

Extra Features

Add:

Sticky mobile cart

Wishlist (local only)

Recently viewed products

Product badges:

New

Sale

Low stock

Low stock message:
"Only 2 items left"

Include excellent empty states, loading states, success states, and error handling.

The final result should feel premium, trustworthy, fast, modern, and optimized for local businesses that confirm orders by phone rather than online payments.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/db39988d-1d72-4a95-960a-efc7f99d8dee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
