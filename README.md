# VolleyApp - Volleyball Event Management

A full-stack volleyball event management application built with **Angular 19**, **Express.js**, and **MySQL**.

## Features

- **User Authentication** — Register, login, logout with browser cookie-based sessions
- **Account Page** — View and edit profile info (name, age, date of birth, member since)
- **Event Search** — Find events by proximity (geolocation) and creation date
- **Create Events** — Create volleyball events tied to specific locations and courts
- **Event Signup** — Browse event details and sign up/cancel for events

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Angular 19, Angular Material      |
| Backend   | Node.js, Express.js               |
| Database  | MySQL                             |
| Auth      | express-session + MySQL store (cookie-based) |
| Passwords | bcryptjs (salted hashing)         |

## Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **npm** v9+

## Project Structure

```
volleyballApp/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── config/database.js  # MySQL connection pool
│   │   ├── middleware/auth.js   # Session auth middleware
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.js         # Login/register/logout
│   │   │   ├── users.js        # User profile CRUD
│   │   │   ├── events.js       # Events CRUD + signup
│   │   │   ├── locations.js    # Location management
│   │   │   └── courts.js       # Court management
│   │   └── database/           # DB scripts
│   │       ├── schema.sql      # Table definitions
│   │       ├── seed.sql        # Sample data
│   │       └── init.js         # DB initialization script
│   ├── .env                    # Environment config
│   └── package.json
├── frontend/                   # Angular 19 app
│   ├── src/app/
│   │   ├── components/         # Shared components (navbar)
│   │   ├── guards/             # Auth route guard
│   │   ├── models/             # TypeScript interfaces
│   │   ├── pages/              # Page components
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── account/
│   │   │   ├── event-list/
│   │   │   ├── create-event/
│   │   │   └── event-detail/
│   │   └── services/           # API services
│   ├── proxy.conf.json         # Dev proxy to backend
│   └── package.json
└── README.md
```

## Setup & Installation

### 1. Database Setup

Make sure MySQL is running, then initialize the database:

```bash
cd backend

# Edit .env with your MySQL credentials
# Then run:
npm run db:init
```

This creates the `volleyball_app` database, all tables, and inserts sample data.

### 2. Backend

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and session secret

# Start the server
npm run dev
```

The API runs at `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install

# Start the Angular dev server
npx ng serve
```

The app runs at `http://localhost:4200`. The dev server proxies `/api` requests to the backend.

## API Endpoints

### Auth
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| POST   | `/api/auth/register` | Create a new account |
| POST   | `/api/auth/login`    | Log in                |
| POST   | `/api/auth/logout`   | Log out               |
| GET    | `/api/auth/me`       | Check current session |

### Users
| Method | Endpoint         | Description            |
|--------|------------------|------------------------|
| GET    | `/api/users/me`  | Get profile            |
| PUT    | `/api/users/me`  | Update profile         |

### Events
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/events`             | Search events (with filters) |
| GET    | `/api/events/:id`         | Get event details        |
| POST   | `/api/events`             | Create event             |
| POST   | `/api/events/:id/signup`  | Sign up for event        |
| DELETE | `/api/events/:id/signup`  | Cancel signup            |

### Locations & Courts
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/locations`      | List all locations     |
| GET    | `/api/locations/:id`  | Get location + courts  |
| POST   | `/api/locations`      | Create location        |
| GET    | `/api/courts`         | List courts            |
| POST   | `/api/courts`         | Create court           |

## Database Schema

- **users** — id, email, password_hash, first_name, last_name, date_of_birth, created_at
- **locations** — id, name, address, city, state, zip_code, latitude, longitude
- **courts** — id, location_id, name, court_type, is_indoor, surface_type
- **events** — id, creator_id, court_id, title, description, event_date, max_players, skill_level
- **event_signups** — id, event_id, user_id, created_at (unique constraint on event_id + user_id)

## Testing

The project has full unit and integration test suites for both backend and frontend.

### Backend Tests (Jest + Supertest)

```bash
cd backend

# Run all tests
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

Tests covering:
- **Sanitize middleware** — HTML stripping, text/email/enum/int validation, edge cases
- **Auth middleware** — session checks (present, missing, undefined)
- **Auth routes** — register (validation, duplicate email, XSS), login (missing fields, wrong creds, success), logout, session check
- **User routes** — GET/PUT profile, auth guards, input sanitization
- **Event routes** — search (pagination, SQL injection prevention), my events, get by ID, create (validation, sanitization, clamping), delete (auth, 403, success), signup/cancel (past events, full events, duplicates)

### Frontend Tests (Karma + Jasmine)

```bash
cd frontend

# Run tests (opens Chrome)
npm test

# Run headless (for CI)
npx ng test --watch=false --browsers=ChromeHeadless
```

Tests covering:
- **AppComponent** — component creation
- **AuthService** — login, register, logout, session check, observable emissions, `withCredentials`
- **EventService** — all HTTP methods (correct URLs, verbs, query params, request bodies)
- **UserService** — getProfile, updateProfile
- **authGuard** — allow when logged in, redirect to `/login` when not
