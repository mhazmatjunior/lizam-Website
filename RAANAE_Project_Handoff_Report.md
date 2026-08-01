# PROJECT HANDOFF & PLATFORM FEATURES REPORT
## RAANAE: THE FRAGRANCE OF FREEDOM

---

### Executive Overview
**RAANAE** is a premium, high-fidelity e-commerce platform custom-built for a luxury fragrance brand. Designed with a sleek, dark-mode visual aesthetic, the platform combines modern user experience guidelines (animations, responsive layouts, intuitive swiping) with a robust transaction infrastructure (secure payment gateways, cash on delivery models, and administrative portals).

---

## SECTION 1: BRAND IDENTITY & DESIGN SYSTEM

The platform’s user interface is styled to project luxury, sensory depth, and elegance.

### 1. Typography
*   **Brand Header Serif (`Kalieb Luxury`)**: A custom-loaded luxury typeface used for principal headers, scent classifications, and premium branding badges.
*   **Body & Sans-Serif (`Montserrat`)**: Modern, high-legibility sans-serif used for copy, notes, pricing lists, forms, and administrative portals.

### 2. Color Palette
*   **Obsidian Black (`#000000`)**: The dominant canvas background, reflecting mystery and premium sophistication.
*   **Brushed Luxury Gold (`#e2bb61`)**: Used exclusively for accents, borders, buttons, and callout highlighting.
*   **Frosted Glass (`rgba(255,255,255,0.02)`)**: Semi-transparent card panels layered with subtle backdrop blurs to establish depth.

---

## SECTION 2: CLIENT-FACING PAGES & FEATURES

Below is a detailed breakdown of all user-facing pages, catalog systems, and checkout pathways:

### 1. The Homepage / Landing Hub (`/`)
Designed to introduce the client to the brand's story, vision, and collections.

*   **Responsive Hero Header**:
    *   **Desktop**: Loads a full-screen dynamic backdrop (`theme-hero.webp`) featuring the signature bottle.
    *   **Mobile**: Swaps to a mobile-optimized portrait layout (`hero-bg-mob.jpg`) with a subtle $5\%$ scale zoom for improved centering.
*   **Flagship Carousel (Section 3)**:
    *   **No Black-Screen Flash**: Exiting slides dissolve on top of entering slides to prevent black-screen flickering.
    *   **Mobile Swiping**: Mobile users can swipe left or right to switch slides.
*   **CTA Routing**: Homepage Pre-order and order buttons bypass intermediary catalog pages and take users directly to the flagship details page.

### 2. The Fragrance Catalog (`/products`)
A shop layout showcasing the full RAANAE collection.

*   **Interactive Filters**: Customers can filter fragrances instantly by categories (e.g., *Obsidian*, *Floral*, *Woody*, *Musk*).
*   **Product Cards**: Hovering reveals an animated zoom effect on bottle imagery, displaying prices in PKR (Rs).
*   **Quick Add**: Shoppers can click a quick-add overlay button to place items directly in their shopping bag without leaving the catalog page.

### 3. Product Detail Page (`/products/[id]`)
A dedicated details view for each individual fragrance.

*   **Scent Pyramid**: A tabbed structure displaying **Top Notes** (initial impression), **Heart Notes** (core body), and **Base Notes** (lasting dry-down).
*   **Flagship Layout (7th October - ID `71099`)**:
    *   Sub-heading is set to high-concentration **"Parfum"** (omits standard *Eau de Parfum*).
    *   Highlights the clean chemistry statement in a gold-accented callout box:
        > ✨ **No Harmful Effects and No Side Effects.**
    *   Hides the standard recommended products catalog to keep focus on the flagship bottle release.

### 4. Interactive Shopping Bag (Drawer)
A slide-out cart drawer accessible from the navigation bar on any page:

*   Tracks item quantities, bottle sizes (100ml standard), and calculates totals dynamically.
*   Enables customers to adjust item quantities or remove products in real-time.

### 5. Checkout Hub (`/checkout`)
A simplified billing and shipping checkout system:

*   **Payment Selectors**: Customers can select from three payment options:
    1.  **Online Payment (Safepay)**: Processes secure transactions via Credit/Debit cards or mobile wallets.
    2.  **Standard Cash on Delivery (COD)**: Standard free shipping, paying in cash at delivery.
    3.  **Founder Cash on Delivery (COD)**: Doorstep delivery directly by the founder of RAANAE (+ Rs. 5,000 fee).
*   **Dynamic Order Summary**: Appends the Rs. 5,000 fee line item when *Founder Delivery* is selected.
*   **Routing Logic**: COD orders bypass Safepay and route customers directly to the success page.

### 6. Order Success Page (`/checkout/success/[orderId]`)
Confirms order placement, shows order ID, billing/shipping summaries, and displays a shipping tracking code once assigned by the admin.

---

## SECTION 3: OPERATIONS & ADMIN HUB

The administrative portal allows you to manage operations and inventory securely.

### 1. Secure Admin Login (`/admin/login`)
A password-protected login screen. Uses encrypted credentials to protect your database.

### 2. Orders Dashboard (`/admin/orders`)
A real-time tracker of all order activities:

*   **Status Badges**: Shows order payment statuses (`Safepay`, `COD Standard`, `COD Founder`).
*   **Status Control**: Allows you to update statuses (e.g. *Pending*, *Processing*, *Shipped*, *Completed*, *Cancelled*).
*   **Tracking Numbers**: Allows you to assign carrier tracking codes (`tracker`) which display on the customer's success page.

### 3. Inventory Dashboard (`/admin/inventory`)
Allows you to manage stock levels and catalog pricing:

*   Displays product descriptions, categories, prices, and remaining stock.
*   **Quick Edit Modal**: Click any item to modify its price, stock, or descriptions, updating the catalog instantly.

---

## SECTION 4: SYSTEM ARCHITECTURE & DATABASE

The backend of the platform is designed to be self-healing, fast, and secure.

1.  **Supabase PostgreSQL Database**: Stores your catalog and order data behind Row-Level Security (RLS).
2.  **Failsafe Fallback (Self-Healing)**: If the backend database lacks the new payment method columns, the system automatically appends the selection to the product descriptor (e.g., `[cod_founder]`) and completes the transaction, ensuring checkout never crashes.
3.  **Supabase CDN Storage**: High-resolution image assets are hosted on a public CDN bucket for fast page load times.
4.  **Automatic Image Optimization**: Next.js automatically optimizes and caches image dimensions to improve mobile loading performance.

---

## SECTION 5: PRODUCTION ENVIRONMENT VARIABLES (VERCEL CHECKLIST)

Add the following keys in your Vercel Project settings:

| Key | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ybhzcrqaxtglysnpxcmd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (Copy from `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Copy from `.env.local`) |
| `NEXTAUTH_URL` | `https://www.raanae.com` |
| `NEXTAUTH_SECRET` | Secret JWT hash (Copy from `.env.local`) |
| `ADMIN_EMAIL` | `raanae980@gmail.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt password hash |
| `NEXT_PUBLIC_SAFEPAY_ENVIRONMENT` | `sandbox` OR `production` |
| `NEXT_PUBLIC_SAFEPAY_PUBLIC` | Safepay Public Key |
| `SAFEPAY_SECRET` | Safepay Secret Key |
