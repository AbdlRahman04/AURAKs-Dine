# Development Guide

## Launching the Application

You now have **two options** for running the development server:

### Option 1: Integrated Mode (Single Server) - **Recommended for most cases**
This runs both frontend and backend on the same port (5000).

```bash
npm run dev
```

- **Frontend & Backend**: `http://localhost:5000`
- **Hot Reload**: ✅ Enabled
- **Simpler**: One command, one port

### Option 2: Separate Mode (Two Servers) - **Like VS Code Live Server**
This runs the frontend and backend on separate ports.

```bash
npm run dev:separate
```

- **Frontend (Vite)**: `http://localhost:5173` - Open this in your browser
- **Backend (API)**: `http://localhost:5000` - API requests are automatically proxied
- **Hot Reload**: ✅ Enabled on both servers

You can also run them separately:
```bash
# Terminal 1: Backend only
npm run dev:backend

# Terminal 2: Frontend only  
npm run dev:frontend
```

## Environment Variables

Make sure you have a `.env` file in the root directory with:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_string
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PORT=5000
```

## Accessing the Application

- **Integrated Mode**: Open `http://localhost:5000` in your browser
- **Separate Mode**: Open `http://localhost:5173` in your browser (frontend will proxy API calls to backend)

## Notes

- The separate mode setup uses Vite's proxy feature to forward `/api/*` requests to the backend
- WebSocket connections (`/ws`) are also proxied automatically
- Both modes support hot module replacement (HMR) for instant updates

