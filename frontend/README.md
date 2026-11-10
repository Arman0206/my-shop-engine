# Frontend

React + Vite UI for the Smart Cart Optimization Engine — product catalog, cart, AI-powered recommendations, and an analytics dashboard.

- **Dev server:** `http://localhost:5173` (Vite default)
- **Depends on:** `core-service` and `recommendation-service` running (see the root [README](../README.md))

## Tech Stack

- React 19 + Vite
- React Router
- MUI (Material UI) + Emotion
- Recharts (analytics charts)
- Framer Motion (animations)
- Axios (API calls)

## Setup

```bash
cd frontend
npm install
```

Create a `.env` file in this folder:

```env
VITE_CORE_SERVICE_URL=http://localhost:5001
VITE_RECOMMENDATION_SERVICE_URL=http://localhost:5002
```

## Running

Make sure `core-service` (port 5001) and `recommendation-service` (port 5002) are running first, then:

```bash
npm run dev
```

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint
```

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Overview / landing page |
| `/products` | Product Catalog | Browse all products |
| `/cart` | Cart | View and manage cart items |
| `/recommendations` | Recommendations | AI-suggested related products |
| `/analytics` | Analytics | Charts on recommendation performance |

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 # entrypoint
│   ├── App.jsx                  # routes
│   ├── pages/                   # top-level route components
│   ├── components/
│   │   ├── layout/               # Header, Navbar, Sidebar, Layout
│   │   ├── products/             # ProductCard, etc.
│   │   ├── cart/                 # CartItem, etc.
│   │   ├── recommendations/      # RecommendationCard, etc.
│   │   └── dashboard/            # DashboardCard, etc.
│   ├── services/
│   │   ├── apiClient.js          # axios instances for core/recommendation services
│   │   ├── ProductService.js
│   │   ├── CartService.js
│   │   ├── RecommendationService.js
│   │   └── AnalyticsService.js
│   └── assets/
├── index.html
└── vite.config.js
```

## API Integration

All backend calls go through `src/services/apiClient.js`, which reads the two service URLs from environment variables (`VITE_CORE_SERVICE_URL`, `VITE_RECOMMENDATION_SERVICE_URL`) and exposes two configured Axios instances (`coreApi`, `recommendationApi`) used by the service modules in `src/services/`.
