# SpaceBook - Space Booking SPA

A Single Page Application for managing shared workspace reservations in a company environment.

## Description

SpaceBook allows employees to book shared spaces (meeting rooms, private offices, coworking areas, auditoriums) and lets administrators manage all reservations. The app uses hash-based client-side routing and persists the user session via `localStorage`.

## Technologies Used

- **Vite** – build tool and dev server
- **Vanilla JavaScript (ES Modules)** – no frontend framework
- **TailwindCSS** – utility-first styling
- **json-server** – simulated REST API
- **localStorage** – session persistence

## Installation

Make sure you have **Node.js 18+** installed.

```bash
npm install
```

## Running the Project

You need two terminals running at the same time:

**Terminal 1 – JSON Server (API):**
```bash
npm run server
```
This starts the API at `http://localhost:3001`.

**Terminal 2 – Vite Dev Server:**
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

> Both servers must be running simultaneously for the app to work correctly.

## Test Users

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@test.com    | Admin123* |
| User  | user1@test.com    | User123*  |
| User  | user2@test.com    | User123*  |

## Project Structure

```
space-booking/
├── db.json                  # json-server database
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.js              # Entry point
    ├── style.css            # Tailwind + custom component classes
    ├── router/
    │   └── index.js         # Hash-based SPA router with route guards
    ├── services/
    │   ├── auth.js          # Login, session read/write, logout
    │   ├── reservations.js  # CRUD + conflict detection
    │   └── spaces.js        # Spaces CRUD
    ├── components/
    │   ├── navbar.js        # Top navigation bar
    │   └── modal.js         # Reusable modal + toast alerts
    ├── views/
    │   ├── login.js
    │   ├── userDashboard.js
    │   ├── adminDashboard.js
    │   ├── adminReservations.js
    │   ├── newReservation.js
    │   ├── spaces.js
    │   └── accessDenied.js
    └── utils/
        └── helpers.js       # Status badges, date formatting
```

## Role Permissions

| Feature                      | Admin | User           |
|------------------------------|-------|----------------|
| View all reservations        | ✅    | ❌             |
| View own reservations        | ✅    | ✅             |
| Create reservation           | ✅    | ✅             |
| Edit any reservation         | ✅    | Pending only   |
| Delete reservation           | ✅    | ❌             |
| Approve / Reject reservation | ✅    | ❌             |
| Cancel reservation           | ✅    | Own only       |
| Manage spaces (CRUD)         | ✅    | ❌             |

## Technical Decisions

- **Hash routing** was chosen over the History API to avoid server-side configuration requirements. The router checks authentication and role before rendering any view.
- **Route guards** are implemented directly in the router: unauthenticated users are redirected to `/login`, and users without the required role are redirected to `/access-denied`.
- **Session persistence** uses `localStorage` so the session survives page refreshes. The password is never stored — only the safe user object (id, name, email, role).
- **Duplicate reservation detection** is done on the client before the POST request by checking for time overlaps on the same space and date with non-cancelled/rejected statuses.
- **Modular service layer** separates API concerns from view logic, making each module independently testable and easy to swap for a real backend.
- The project intentionally avoids any frontend framework to demonstrate understanding of vanilla DOM manipulation, event handling, and dynamic rendering.
