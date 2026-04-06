# HomeRent — Full-Stack Housing Rental & Booking Platform

A modern, multi-language housing rental platform built with React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Features

- **User registration & login** with JWT authentication
- **Browse, search & filter** listings with debounce, sorting, pagination
- **Book housing** with date selection, price calculation, double-booking prevention
- **Fake payment system** (UNPAID → PAID + CONFIRMED)
- **Reviews & ratings** with automatic average recalculation
- **Favorites / wishlist**
- **Admin panel** with Recharts dashboard (revenue, user growth, top listings)
- **Admin management** of users (role/status), listings (approve/deny), bookings
- **Audit logs** for all admin actions
- **Multi-language** support (English, Russian, Kazakh)
- **Dark/Light mode** toggle
- **Responsive design** (mobile + desktop)
- **Image gallery** with lightbox
- **Soft delete** for bookings and listings
- **Toast notifications** on all actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Charts | Recharts |
| Icons | Heroicons |
| i18n | react-i18next (EN/RU/KK) |
| Animations | Framer Motion |
| Notifications | react-hot-toast |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** running on localhost:5432

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homerent?schema=public"
JWT_SECRET="your_secret_key_here"
PORT=5000
```

### 3. Setup database

```bash
cd backend

# Create database and run migrations
npx prisma migrate dev --name init

# Seed sample data
npm run seed
```

### 4. Run development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The frontend runs on **http://localhost:5173** and proxies API calls to the backend on port 5000.

## Render Deployment

If you deploy the frontend and backend as separate Render services, the frontend must know the backend URL at build time.

### Backend service

Set these environment variables in Render:

```env
DATABASE_URL="your_render_postgres_connection_string"
JWT_SECRET="your_strong_secret"
PORT=10000
```

Run database migrations during deploy before starting the server:

```bash
npx prisma migrate deploy && npm start
```

### Frontend service

Set this environment variable in the frontend Render service and redeploy:

```env
VITE_API_URL="https://your-backend-service.onrender.com"
```

`HomeRent` will automatically normalize that value to `https://your-backend-service.onrender.com/api`, so you can provide either the backend domain or the full `/api` URL.

If frontend and backend are served from the same origin, you can keep the default `'/api'`.

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homerent.com | admin123 |
| User | user1@homerent.com | user123 |
| User | user2@homerent.com | user123 |

## Project Structure

```
HomeRent/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   ├── roleGuard.js       # Role-based access
│   │   │   └── validate.js        # Request validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # Register, Login, Me
│   │   │   ├── user.routes.js     # User CRUD (admin)
│   │   │   ├── listing.routes.js  # Listings with search/geo
│   │   │   ├── booking.routes.js  # Bookings with payment
│   │   │   ├── review.routes.js   # Reviews with rating recalc
│   │   │   ├── favorite.routes.js # Favorites toggle
│   │   │   ├── upload.routes.js   # Image upload
│   │   │   └── admin.routes.js    # Stats & audit logs
│   │   ├── utils/
│   │   │   ├── auditLog.js        # Audit logging
│   │   │   ├── email.js           # Email utility
│   │   │   └── rating.js          # Rating recalculation
│   │   └── server.js              # Express entry point
│   ├── uploads/                   # Uploaded images
│   ├── seed.js                    # Database seeder
│   ├── .env                       # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── Modal.jsx          # Modal + ImageGallery
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── i18n/
│   │   │   ├── index.js
│   │   │   └── locales/           # en.json, ru.json, kk.json
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ListingsPage.jsx
│   │   │   ├── ListingDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── FavoritesPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminListings.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AdminLogs.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/users | Admin | List users (paginated) |
| PATCH | /api/users/:id/role | Admin | Change user role |
| PATCH | /api/users/:id/status | Admin | Block/unblock user |
| GET | /api/listings | No | Search listings (paginated) |
| POST | /api/listings | Yes | Create listing |
| GET | /api/listings/:id | No | Listing detail |
| PATCH | /api/listings/:id/approve | Admin | Approve/deny |
| POST | /api/bookings | Yes | Create booking |
| PATCH | /api/bookings/:id/pay | Yes | Fake payment |
| PATCH | /api/bookings/:id/cancel | Yes | Cancel booking |
| POST | /api/reviews | Yes | Create review |
| POST | /api/favorites | Yes | Toggle favorite |
| POST | /api/upload | Yes | Upload image |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/logs | Admin | Audit logs |
