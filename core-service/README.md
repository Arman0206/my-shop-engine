# Core Service

Express + MongoDB API that owns **product** and **cart** data for the Smart Cart Optimization Engine. This is the source of truth other services (like `recommendation-service`) read from.

- **Port:** `5001` (default)
- **Database:** MongoDB Atlas, `smartcart` database

## Setup

```bash
cd core-service
npm install
```

Create a `.env` file in this folder:

```env
PORT=5001
MONGO_URI=<your MongoDB Atlas connection string>
```

## Running

```bash
npm run dev     # nodemon, auto-restarts on changes
npm start       # plain node
```

On success you'll see:
```
MongoDB connected: <host>
core-service running on port 5001
```

## API Overview

Full request/response examples are in [`../docs/API_CONTRACTS.md`](../docs/API_CONTRACTS.md). Summary:

### Health
- `GET /health` — service status check

### Products
| Method | Route | Description |
|---|---|---|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/:id` | Get a product by ID |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |

### Cart
| Method | Route | Description |
|---|---|---|
| `POST` | `/cart` | Add an item to a user's cart |
| `GET` | `/cart?userId=<id>` | Get a user's cart (with populated product details) |
| `GET` | `/cart/popularity` | Get product popularity data |
| `DELETE` | `/cart/:id` | Remove an item from a cart |

## Project Structure

```
core-service/
├── src/
│   ├── server.js               # entrypoint — connects DB, starts HTTP server
│   ├── app.js                  # Express app setup, route mounting
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── middlewares/
│   │   └── errorHandler.js
│   └── modules/
│       ├── products/            # product model, service, controller, routes
│       └── cart/                # cart model, service, controller, routes
└── package.json
```

## Data Models

See [`../docs/DATABASE_SCHEMA.md`](../docs/DATABASE_SCHEMA.md) for the full `Products` and `Cart` collection schemas.

## Notes for other services

`recommendation-service` reads from this service via HTTP:
- `GET /products` — for scoring/comparison data
- `GET /cart?userId=<id>` — for current cart contents (with product info already populated)
