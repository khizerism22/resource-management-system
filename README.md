# ResourceOps Health Console (MERN Monorepo)

Internal resource management + sprint health governance layer built with **Vite + React** and **Express + MongoDB**.

This repo is a **workspaces monorepo**:
- `client/` — Vite React frontend
- `server/` — Express + MongoDB backend (ESM)

## Features
- Authentication (JWT) with role‑based access control
- User management (Admin only)
- Project management + project health dashboard
- Sprint management + sprint health reporting
- Resource & allocation management with capacity tracking
- Alerts/notifications for critical events
- Reporting & analytics with export (CSV / PDF / Excel)

---

## Requirements
- Node.js 18+ (20+ recommended)
- MongoDB (local or Atlas)

---

## Quick Start

### 1) Install dependencies (workspace root)
```bash
npm install
```

### 2) Configure environment
Create `server/.env`:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/mern_health
JWT_SECRET=your_long_random_string
CORS_ORIGIN=http://localhost:5173
```

### 3) Run everything
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`  
Backend runs on: `http://localhost:3000`

---

## Scripts

From repo root:
```bash
npm run dev          # run client + server
npm run dev:client   # client only
npm run dev:server   # server only
npm run build:client # production build
npm run preview:client
```

---

## API Overview

Base URL: `http://localhost:3000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users
- `GET /users` (Admin)
- `POST /users` (Admin)
- `GET /users/:id`
- `PUT /users/:id`
- `PUT /users/:id/role` (Admin)
- `DELETE /users/:id` (Admin)

### Projects
- `GET /projects`
- `POST /projects` (PM/Admin)
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/:id/health`

### Sprints
- `POST /projects/:projectId/sprints`
- `GET /projects/:projectId/sprints`
- `GET /sprints/:id`
- `PUT /sprints/:id`
- `DELETE /sprints/:id`
- `GET /sprints/:id/status`

### Sprint Health
- `POST /sprints/:sprintId/health`
- `GET /sprints/:sprintId/health`
- `PUT /sprints/:sprintId/health`
- `GET /sprints/:sprintId/health/history`

### Resources & Allocations
- `GET /resources`
- `POST /resources`
- `PUT /resources/:id`
- `DELETE /resources/:id`
- `GET /resources/available`
- `GET /resources/:id/allocations`
- `GET /resources/utilization`
- `GET /allocations`
- `POST /allocations`
- `PUT /allocations/:id`
- `DELETE /allocations/:id`
- `GET /allocations/conflicts`

### Dashboards
- `GET /dashboard/project/:id`
- `GET /dashboard/portfolio`
- `GET /dashboard/trends/:projectId`

### Reports
- `GET /reports/sprint-success-trend/:projectId`
- `GET /reports/scrum-maturity-trend/:projectId`
- `GET /reports/resource-utilization`
- `GET /reports/recurring-failures`

### Alerts
- `GET /alerts`
- `GET /alerts/unread-count`
- `PUT /alerts/mark-all-read`
- `PUT /alerts/:id/read`
- `PUT /alerts/:id/archive`
- `DELETE /alerts/:id`

---

## Roles
- `Admin`
- `PM`
- `TeamLead`
- `Stakeholder`

---

## Notes
- MongoDB is required for all core features.
- Alerts are generated when:
  - Sprint outcome is **Failure**
  - 3 consecutive **AtRisk** sprints
  - Allocation exceeds capacity

---

## Folder Structure
```
.
├─ client/                # React (Vite)
├─ server/                # Express (ESM)
└─ README.md
```

---

## License
Internal use. Add your license if required.
