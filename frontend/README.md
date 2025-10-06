# Healthcare Pro Frontend (Vite + React)

The `frontend2/react_app` project is the primary user interface for Healthcare Pro. It delivers role-based dashboards for patients, doctors, and administrators, integrating directly with the Django REST API.

## ✨ Key Features

- **Role-aware authentication** with JWT storage and automatic refresh handling.
- **Admin console** with live doctor/patient rosters, instant refresh, and a schedule view that always reflects the selected day.
- **Doctor workspace** powered by a dedicated `DoctorDataProvider`, including dashboards, appointments, patient records, and availability management.
- **Patient portal** with appointment history, medical records, and quick scheduling through a shared modal experience.
- **Unified appointment modal** that adapts its form to the current role while talking to the backend booking endpoints.
- **Resilient data layer** featuring optimistic UI updates, loading states, cache helpers, and retry-aware API utilities.

## 🛠️ Prerequisites

- Node.js 20+
- npm 10+
- A running instance of the Healthcare Pro backend (default: `http://127.0.0.1:8000`)

## 🚀 Local Development

1. Install dependencies
   ```powershell
   npm install
   ```

2. Create a `.env.local` if you need to override API defaults (optional)

3. Start the development server
   ```powershell
   npm run dev
   ```

4. Visit [http://localhost:5173](http://localhost:5173) and log in with one of the test accounts listed in the integration guide.

## 🧱 Project Structure (Highlights)

```
src/
├── App.jsx                     # Route wiring and role guards
├── components/
│   └── ScheduleAppointmentModal.jsx
├── doctor/
│   ├── DoctorDataContext.jsx   # Centralized doctor data provider
│   └── DoctorDashboard.jsx
├── pages/
│   ├── AdminDashboard.jsx      # Today-first schedule with quick actions
│   ├── AdminDataContext.jsx    # Fetch & cache admin resources
│   ├── PatientDashboard.jsx
│   └── Auth/Registration pages
├── services/
│   └── api.js                  # API client + endpoint helpers
└── utils/
    └── time.js                 # Date/time formatting utilities
```

## 🧪 Available Scripts

```powershell
npm run dev       # Start Vite dev server
npm run build     # Type-check and build for production
npm run preview   # Preview the production build locally
```

## 🔐 Environment & Authentication

- JWT access/refresh tokens are stored in `localStorage` under `access_token` and `refresh_token`.
- `DoctorDataContext` and `AdminDataContext` automatically retry after silent refresh on 401 responses.
- To start fresh, use the **Logout** buttons or clear storage with `localStorage.clear()` in the browser console.

## 🆘 Troubleshooting

- **401 Unauthorized**: ensure the backend is running and the test user credentials match the database.
- **CORS warnings**: confirm the proxy settings in `vite.config.ts` align with your backend URL.
- **Stale data**: use the refresh controls in the UI; they call `refresh*` helpers from the context providers.

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Run `npm run lint` or your preferred checks before committing.
3. Submit a pull request describing the feature or fix.

---

Healthcare Pro Frontend • Updated October 2025
