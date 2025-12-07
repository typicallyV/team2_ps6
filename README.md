# ElderEase — README

ElderEase is a simple React + Express app to manage elderly care features (onboarding, prescriptions, reminders). Backend stores uploaded prescriptions in MongoDB (base64) via the Upload model.

## Quick overview
- Frontend: React (src/)
- Backend: Express (backend/)
- DB: MongoDB Atlas (configured via backend/.env → MONGO_URI)
- Key API endpoints (backend/routes/uploadRoutes.js):
  - POST  /upload                 — upload a file (form-data field `file`)
  - GET   /prescriptions          — list uploaded prescriptions
  - GET   /prescriptions/:id      — retrieve file (binary)
  - DELETE /prescriptions/:id     — delete file record

## Prerequisites
- Node.js (16+)
- npm
- MongoDB Atlas (or local MongoDB)

## Install
1. From repo root:
   npm install

## Backend (run server)
1. Create/edit backend/.env and set:
   MONGO_URI=your_mongo_uri
   PORT=5000
2. Start backend:
   node backend/server.js
   - Server logs will print connection status and route activity.
   - Diagnostic scripts (see below) can be run separately.

## Frontend (run React app)
1. From repo root:
   npm start
2. App available at http://localhost:3000 (default CRA port)

## API usage (frontend behavior)
- Uploading from frontend sends FormData with key "file" to POST http://localhost:5000/upload.
- Frontend lists prescriptions via GET http://localhost:5000/prescriptions.
- Viewing/downloading uses GET http://localhost:5000/prescriptions/:id.
- Deleting uses DELETE http://localhost:5000/prescriptions/:id.

## Diagnostics
- Use the provided diagnostic scripts in backend to inspect DB contents:
  - backend/diagnostic-upload.js — checks the Upload collection (active storage)
    node backend/diagnostic-upload.js
  - backend/diagnostic.js — checks the old Prescription collection (legacy)
    node backend/diagnostic.js
- After running and saving outputs, it's safe to remove these diagnostic files.

## Notes & troubleshooting
- Ensure MONGO_URI is correct and Atlas network access allows your server IP (or 0.0.0.0/0 for testing).
- If uploads appear missing in the `Prescription` collection, check `Upload` collection — the app currently saves to Upload (base64) model.
- Common issues:
  - Backend connecting to localhost instead of Atlas → check backend/.env and server logs.
  - Frontend using wrong endpoints (e.g., `/prescription`) — ensure frontend uses `/prescriptions` and `/upload`.
- To verify DB records quickly:
  node backend/diagnostic-upload.js

## Cleanup
- After diagnostics, delete:
  - backend/diagnostic-upload.js
  - backend/diagnostic.js

## Contact
- For further changes (onboarding persistence, auth, reminders), update backend models/routes and hook frontend accordingly.
