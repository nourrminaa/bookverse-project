# BookVerse

An e-commerce bookstore platform built with Node.js/Express, MySQL, and EJS — designed and themed for a Lebanon-based bookstore.

## Features

### Storefront
- Browse and filter books by category, author, and price range (shop, top picks)
- Full-text search across title and author
- Book detail pages with description, price, and add-to-cart
- Cart with quantity management, stock validation, and category-based recommendations
- Checkout flow that creates an order and clears the cart
- B2B services page (book corners, Braille books, corporate gifting)
- Contact form that saves messages to the DB
- Support page with admin-managed FAQ list

### Admin Panel
- Dashboard: total books, orders, users, pending orders count; top 5 selling books chart
- Books: add, edit, delete; search by title/author
- Orders: filter by status or customer name; update status (Pending → Processing → Completed); stock is deducted when status is set to Processing
- Users: add users, toggle Active/Inactive status
- Messages: inbox of contact form submissions, mark as read
- Settings: manage FAQ entries, store phone number, flash sale (applies a percentage discount to all book prices in-place; ending the sale restores original prices)

## Tech Stack

| Dependency | Purpose |
|---|---|
| Node.js + Express 5 | Server, routing (ESM modules) |
| EJS 3 | Server-side templating |
| MySQL + mysql2 | Database (promise pool) |
| express-session + express-mysql-session | DB-backed sessions |
| bcrypt / bcryptjs | Password hashing |
| Chart.js 4 | Admin dashboard sales chart |
| Bootstrap 5.3 | Frontend UI |
| dotenv | Environment variable loading |
| nodemailer | (Installed, available for email) |

## Prerequisites

- Node.js (v18+ recommended for `--watch` support)
- MySQL server running and accessible

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/nourrminaa/bookverse-project.git
   cd bookverse-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your MySQL credentials.

4. **Set up the database**

   There is no migration script. Create the database and tables manually using the schema described in the [Database Schema](#database-schema) section below.

5. **Start the server**
   ```bash
   npm run dev    # development (auto-reloads on file change)
   npm start      # production
   ```

6. **Open the app**

   Visit `http://localhost:8000`

## Environment Variables

| Key | Description |
|---|---|
| `DB_HOST` | MySQL host (e.g. `localhost`) |
| `DB_PORT` | MySQL port (default `3306`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |

## Project Structure

```
bookverse-project/
├── server.js               # Entry point: Express setup, session store, routers
├── package.json
├── .env.example
├── routes/
│   ├── auth.js             # /auth/* — login, register, logout
│   ├── admin.js            # /admin/* — all admin panel routes
│   └── client.js           # /* — storefront routes
├── utils/
│   ├── credentials.js      # Reads .env, exports dbConfig
│   ├── database.js         # Creates mysql2 promise pool, exports pool
│   └── path.js             # ESM __dirname workaround
├── views/
│   ├── admin-interface/    # Admin panel EJS pages + includes/aside-bar.ejs
│   ├── client-interface/   # Storefront EJS pages + includes/
│   └── login-page/         # Login and register pages
└── public/
    ├── styles/
    ├── scripts/
    └── assets/
```

## Routes Reference

### Client Routes

| Method | Path | Description |
|---|---|---|
| GET | `/` | Homepage with featured books |
| GET | `/shop` | Shop with search/category/author/price filters |
| GET | `/top-picks` | Newest 6 books (filterable) |
| GET | `/item/:id` | Book detail page |
| GET | `/cart` | Cart (login required) |
| POST | `/cart/add` | Add book to cart |
| POST | `/cart/update` | Update cart item quantity |
| POST | `/cart/remove` | Remove item from cart |
| POST | `/checkout` | Create order from cart |
| GET | `/b2b` | B2B services page |
| GET | `/about` | About page |
| GET | `/support` | Support/FAQ page |
| GET | `/contact` | Contact page |
| POST | `/contact` | Submit contact message |
| GET | `/auth/login` | Login page |
| POST | `/auth/login` | Authenticate user |
| GET | `/auth/register` | Register page |
| POST | `/auth/register` | Create new customer account |
| POST | `/auth/logout` | Destroy session |

### Admin Routes

All `/admin/*` routes require `req.session.role === "Admin"`. Unauthenticated or non-admin requests are redirected to `/auth/login`.

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Stats overview + top selling books chart |
| GET | `/admin/books` | Books list with search |
| POST | `/admin/books/add` | Add a new book |
| POST | `/admin/books/update` | Update book details |
| POST | `/admin/books/delete` | Delete a book |
| GET | `/admin/orders` | Orders list with search and status filter |
| POST | `/admin/orders/get` | Get order details as JSON |
| POST | `/admin/orders/update-status` | Update order status (deducts stock on → Processing) |
| GET | `/admin/messages` | Contact messages inbox |
| POST | `/admin/messages/mark-read` | Mark a message as read |
| GET | `/admin/users` | User list |
| POST | `/admin/users/add` | Add a user (Admin or Customer) |
| POST | `/admin/users/update-status` | Set user Active/Inactive |
| GET | `/admin/settings` | Settings page |
| POST | `/admin/settings/save-faqs` | Save FAQ list (JSON) |
| POST | `/admin/settings/save-store` | Save store phone number |
| POST | `/admin/settings/flash-sale/start` | Apply percentage discount to all book prices |
| POST | `/admin/settings/flash-sale/end` | Restore original book prices |

## Database Schema

| Table | Key columns |
|---|---|
| `users` | id, name, email, password_hash, role (Admin/Customer), status (Active/Inactive), joined, orders |
| `books` | id, title, author, price, old_price, img, alt, description, stock, category |
| `orders` | id, user_id, customer_name, customer_email, status (Pending/Processing/Completed), total |
| `order_items` | id, order_id, book_id, title, author, price, quantity |
| `cart_items` | id, user_id, book_id, quantity |
| `messages` | id, name, email, message, is_read, created_at |
| `settings` | setting_key (PK), setting_value — stores `faqs` (JSON array), `store_phone`, `flash_sale_active`, `flash_sale_percent` |

## Authentication

Session-based authentication via `express-session` with MySQL session storage. On login, `req.session.role` is set to either `"Admin"` or `"Customer"`. Admins are redirected to `/admin/dashboard`; customers go to `/`. Inactive accounts are blocked at login. Passwords are hashed with bcrypt (cost factor 10).
