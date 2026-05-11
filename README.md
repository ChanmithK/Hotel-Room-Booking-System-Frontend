# Kenora Hotel Booking System — Frontend

Staff-facing web application built with **Next.js 14**, **Tailwind CSS**, and **React Context**.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Notifications:** react-hot-toast
- **Date Utilities:** date-fns
- **Auth:** JWT stored in localStorage

---

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.js                  # Root layout with AuthProvider + Toaster
│   │   ├── page.js                    # Redirects to /dashboard
│   │   ├── globals.css                # Tailwind base + custom classes
│   │   ├── login/
│   │   │   └── page.js                # Login page
│   │   └── dashboard/
│   │       ├── layout.js              # Auth guard + Sidebar wrapper
│   │       ├── page.js                # Dashboard home with stats
│   │       ├── rooms/
│   │       │   └── page.js            # Rooms management
│   │       ├── bookings/
│   │       │   └── page.js            # Bookings management
│   │       └── users/
│   │           └── page.js            # Staff accounts (admin only)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.js             # Role-based sidebar navigation
│   │   └── ui/
│   │       └── Modal.js               # Reusable modal component
│   ├── context/
│   │   └── AuthContext.js             # Global auth state (user, login, logout)
│   └── lib/
│       └── api.js                     # Axios instance with JWT interceptor
├── jsconfig.json                      # Path alias @/ → src/
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

---

## Prerequisites

- **Node.js** v18 or higher → https://nodejs.org
- **Backend server running** on `http://localhost:5000`

> Make sure you complete the backend setup first before running the frontend.

---

## Installation

### 1. Clone and navigate to server folder

```bash
git clone https://github.com/ChanmithK/Hotel-Room-Booking-System-Frontend.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env.local
```

Open `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> If your backend runs on a different port, update this value.

### 4. Start the development server

```bash
npm run dev
```

App will run at: **http://localhost:3000**

---

## First Time Setup

Before logging in, make sure the admin account is seeded in the backend:

```bash
curl -X POST http://localhost:5000/api/auth/seed
```

Then open **http://localhost:3000** and log in with:

```
Email:    admin@hotel.com
Password: admin123
```

---

## Setting Up All Three Roles

After logging in as admin, follow these steps to set up the full system:

### Step 1 — Create a Manager (as Admin)

1. Go to **Users** in the sidebar
2. Click **Add Staff**
3. Fill in name, email, password
4. Set role to **Manager**
5. Click **Create Staff**

### Step 2 — Create a Receptionist (as Admin)

1. Go to **Users**
2. Click **Add Staff**
3. Set role to **Receptionist**
4. Click **Create Staff**

### Step 3 — Add Rooms (as Manager)

1. Log out, log back in as the manager account
2. Go to **Rooms**
3. Click **Add Room**
4. Fill in room number, type, floor, capacity, price
5. Click **Create Room**

### Step 4 — Make a Booking (as Receptionist)

1. Log out, log back in as the receptionist account
2. Go to **Bookings**
3. Click **New Booking**
4. Select check-in and check-out dates
5. Pick an available room from the dropdown
6. Enter guest details and click **Create Booking**

---

## Pages & Access Control

### Login `/login`

- Public page
- Redirects to `/dashboard` after successful login

### Dashboard `/dashboard`

| Role         | What they see                       |
| ------------ | ----------------------------------- |
| Admin        | Welcome message + link to Users     |
| Manager      | Stats cards + recent bookings table |
| Receptionist | Stats cards + recent bookings table |

### Rooms `/dashboard/rooms`

| Role         | Access                           |
| ------------ | -------------------------------- |
| Manager      | View + Add + Edit + Remove rooms |
| Receptionist | View only                        |
| Admin        | No access (redirected)           |

### Bookings `/dashboard/bookings`

| Role         | Access                                |
| ------------ | ------------------------------------- |
| Manager      | View + Create + Cancel + Check-in/out |
| Receptionist | View + Create + Cancel + Check-in/out |
| Admin        | No access (redirected)                |

### Users `/dashboard/users`

| Role         | Access                                              |
| ------------ | --------------------------------------------------- |
| Admin        | View + Create + Edit + Delete + Activate/Deactivate |
| Manager      | No access (redirected)                              |
| Receptionist | No access (redirected)                              |

---

## Environment Variables

| Variable              | Description          | Default                     |
| --------------------- | -------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build for production                     |
| `npm start`     | Start production server (after build)    |

---

## Build for Production

```bash
npm run build
npm start
```

---

## How Authentication Works

1. User logs in → backend returns a JWT token
2. Token is saved to `localStorage`
3. Every API request automatically includes `Authorization: Bearer <token>` header (via axios interceptor)
4. If the token expires or is invalid, the user is automatically redirected to `/login`
5. On logout, token is removed from `localStorage`

---

## Tailwind Custom Classes

Defined in `globals.css` for consistency:

| Class            | Usage                               |
| ---------------- | ----------------------------------- |
| `.btn-primary`   | Blue primary action button          |
| `.btn-secondary` | White outlined button               |
| `.btn-danger`    | Red destructive action button       |
| `.input`         | Standard form input field           |
| `.card`          | White rounded container with shadow |
| `.badge`         | Small status pill label             |
