# WasteWise AI 🍗⚡
### Fried Chicken Restaurant • Inventory, Expiry Tracking & Real-Time POS System

<p align="center">
  <img src="public/logo.png" alt="WasteWise AI Logo" width="180" style="border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);" />
</p>

WasteWise AI is a specialized, production-ready restaurant inventory management and point-of-sale (POS) web application designed specifically for **Fried Chicken Restaurants**. It tracks fast-expiring fresh batches, prevents kitchen and cold-storage food waste with an AI-driven dynamic markdown engine, executes atomic real-time POS checkouts, and enforces enterprise-grade security and role-based access control (RBAC).

---

## 🔐 1. Authentication & Security (Fully Automated RBAC)

- **Clean & Uncluttered Login**: Modern, distraction-free authentication card with company logo, title, email, and password. Manual role selectors and demo bypass buttons have been removed.
- **Automated Role Detection**: Users sign in with their credentials; the server verifies passwords using `bcrypt` (10 salt rounds) and securely routes users based on their authenticated role:
  - **Administrators** &rarr; Admin Control Panel (`/admin`)
  - **Cashiers** &rarr; POS Terminal (`/cashier`)
- **Strict RBAC Enforcement**:
  - Cashiers are strictly blocked from viewing supplier costs, food gross margins, audit logs, or accessing backend admin endpoints (`HTTP 403 Forbidden`).
  - Cashiers cannot delete menu items, modify retail prices, or apply manual markdowns.
- **Brute-Force & Flood Protection**:
  - Sliding-window in-memory rate limiting on `/api/auth/login` (max 10 requests per 15 min per IP) and `/api/checkout` (max 30 requests per 1 min per IP) returning `HTTP 429 Too Many Requests`.
- **Zero Client-Side Price Trust**:
  - Order prices, discounts, taxes (8%), and totals are computed strictly server-side from authoritative database records. Client-provided prices or altered totals are discarded.
- **Expired Stock Selling Blocker**:
  - The checkout pipeline rejects any order containing items with `daysUntilExpiry <= 0` with `HTTP 400 Bad Request`.
- **Atomic Stock Deduction**:
  - Two-pass transaction check verifies inventory availability for all items before decrementing, preventing race conditions and negative stock.
- **Token Invalidation on Logout**:
  - `POST /api/auth/logout` revokes active tokens in the server blacklist; subsequent attempts with revoked tokens return `HTTP 401 Unauthorized`.
- **Enterprise Audit Trail**:
  - Every administrative action (`CREATE_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `MARKDOWN_PRODUCT`, `RESET_DATABASE`, `USER_LOGIN`, `USER_LOGOUT`, `EXPORT_DATABASE_BACKUP`) is logged in an immutable ledger with timestamp, user, action, and IP.

### Pre-seeded Restaurant Accounts
| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@wastewise.com` | `Admin@123` | Full access: inventory management, add/edit/delete products, financial analytics, audit logs, JSON backups, live waste reports. |
| **Cashier** | `cashier@wastewise.com` | `Cashier@123` | Restricted access: POS menu catalog, retail prices, order processing with instant database stock deduction. |

---

## 🍗 2. Fried Chicken Menu & Catalog (Anchor Date: Nov 15, 2026)

| Item Name | Category | Retail Price (EGP) | Stock | Expiry Window | Status Badge |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Crispy Chicken Bucket (12 Pcs)** | Buckets | **250 EGP** | 45 Buckets | 4 days (`2026-11-19`) | 🟢 **Safe (Green)** |
| **Spicy Fried Chicken Meal (3 Pcs)** | Meals | **95 EGP** | 120 Meals | 2 days (`2026-11-17`) | ⚠️ **Warning (Amber, Expiry Alert & Pulse)** |
| **French Fries (Large)** | Sides | **35 EGP** | 200 Portions | 5 days (`2026-11-20`) | 🟢 **Safe (Green)** |
| **Garlic Coleslaw Salad** | Sides | **20 EGP** | 80 Cups | 1 day (`2026-11-16`) | 🔴 **Critical Expiry (Red & Pulse)** |
| **Special Cheddar Sauce** | Sauces | **15 EGP** | 150 Units | 10 days (`2026-11-25`) | 🟢 **Safe (Green)** |
| **Soft Drink Can** | Drinks | **20 EGP** | 300 Cans | 60 days (`2027-01-14`) | 🟢 **Safe (Green)** |

---

## 📊 3. Admin Control Panel Features

- **Live Stock Tracker Table**: Real-time inventory table with item names, categories, costs, retail prices, stock units, expiry dates, and live status badges.
- **Critical Expiry Pulse Effect**: Items within &le; 2 days of expiration pulse with an ambient glowing border (`animation: pulseWarning 2s infinite ease-in-out`).
- **Live Wastage & True Financials**: Authoritative calculation of gross revenue, COGS, net profit, and at-risk waste loss (in EGP) computed directly from recorded transactions.
- **AI Dynamic Markdown Engine**: Suggests optimized promotional markdowns (25% to 50%) to accelerate sell-through before spoilage occurs.
- **Enterprise Audit Logs Tab**: Live inspection of administrative actions and authentication events.
- **JSON Backup Export**: One-click download of the complete database backup (`GET /api/admin/export`).
- **Session State Persistence**: Remembers the selected admin tab in `sessionStorage` across page refreshes.

---

## 🛒 4. Cashier POS Screen Features

- **Menu Grid**: Clean card layout showcasing menu items with photography, names, SKUs, and retail prices in **EGP**.
- **Barcode / SKU Scanner Support**: Type or scan any barcode/SKU in the search box and press `Enter` to instantly add the item to the order bill.
- **Multiple Payment Tenders**: Support for Cash (with instant change calculation), Visa / Debit Card (EMV tap simulation), and Mobile Wallet (Vodafone Cash / InstaPay).
- **Double-Checkout Guard**: Disables the checkout button immediately on submission with an authorization spinner.
- **Optimistic UI Update**: Product stock is decremented locally in state immediately upon checkout while synchronizing silently with the backend.
- **Printable Thermal Receipt**: Printable modal invoice complete with company logo, itemized list, cashier ID, barcode graphic, and payment tender breakdown.

---

## 🚀 5. Quick Start & Test Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Run Automated 14-Point Test Suite
```bash
npm test
```
Verifies:
- Automated authentication for `admin@wastewise.com` and `cashier@wastewise.com`
- Role redirection & RBAC 403 Forbidden enforcement
- Omission of cost prices for cashier accounts
- Expiry detection for 1-day critical (Coleslaw) and 2-day warning (Spicy Meal)
- Zero client-side price trust & server authoritative calculation
- Block on selling expired stock
- Atomic stock deduction & negative inventory prevention
- Strict markdown bounds (1% to 90%)
- Creation past expiry guard
- Enterprise audit logs & JSON backup export
- Token invalidation on logout
- Brute-force rate limiting (HTTP 429 on 11th login attempt)

---

## 🌐 6. Supabase Cloud Integration

The platform includes cloud synchronization with Supabase:
- **Supabase Project URL:** `https://nxiajseyrarmmnddjmoa.supabase.co`
- **Publishable Key:** Configurable via `.env` / `.env.example`
- **Resilient Fallback:** Automatically operates with local verified state if cloud tables are pending schema synchronization, ensuring zero loading freezes.

---

## 📄 License
ISC License. Built for WasteWise AI Enterprise.
