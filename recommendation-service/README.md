# Recommendation Service

Express service that scores and ranks products related to a given item, and generates human-readable reasons for each recommendation using an LLM (Gemini). It reads product and cart data from `core-service`.

- **Port:** `5002` (default)
- **Depends on:** `core-service` (running on port 5001 by default), MongoDB Atlas

## Setup

```bash
cd recommendation-service
npm install
```

Create a `.env` file in this folder:

```env
PORT=5002
MONGO_URI=<your MongoDB Atlas connection string>
CORE_SERVICE_URL=http://localhost:5001
GEMINI_API_KEY=<your Gemini API key>
```

## Running

Make sure `core-service` is already running (this service calls it to fetch product/cart data), then:

```bash
npm run dev     # nodemon, auto-restarts on changes
npm start       # plain node
```

On success you'll see:
```
MongoDB connected: <host>
Recommendation Service running on port 5002
```

## API Overview

### Health
- `GET /health` — service status check

### Recommendations
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/recommendations/:productId` | Get ranked, related products for a given product, each with a `score` and an LLM-generated `reason` |

Response shape:
```json
{
  "selectedProduct": { "...": "product fields" },
  "recommendations": [
    { "...": "product fields", "score": 0.87, "reason": "Frequently bought with this laptop for extra storage." }
  ]
}
```

## How Recommendations Are Scored

The service combines several signals to rank candidate products:

- **Similarity** — embedding-based similarity between product name/category/brand/description (`similarity.service.js`, `embedding.service.js`, `model.service.js`)
- **Popularity, price, and rating** — pulled from `core-service` (`ranking.service.js`, `scoring.service.js`)
- **Reasoning** — Gemini (via `@google/genai`) generates a short natural-language explanation per recommendation (`llm.service.js`, `prompt.service.js`, `reason.service.js`)

## Project Structure

```
recommendation-service/
├── src/
│   ├── server.js                       # entrypoint — connects DB, starts HTTP server
│   ├── app.js                          # Express app setup, route mounting
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── clients/
│   │   └── coreServiceClient.js         # HTTP client for core-service
│   └── modules/
│       └── recommendations/
│           ├── recommendation.routes.js
│           ├── recommendation.controller.js
│           ├── recommendation.service.js  # orchestrates the pipeline below
│           ├── embedding.service.js       # generates product embeddings
│           ├── similarity.service.js      # computes similarity scores
│           ├── model.service.js           # embedding model loading (onnxruntime/transformers)
│           ├── ranking.service.js         # combines signals into a rank
│           ├── scoring.service.js         # scoring formula
│           ├── llm.service.js             # Gemini client
│           ├── prompt.service.js          # LLM prompt construction
│           └── reason.service.js          # generates the "reason" text per recommendation
└── package.json
```

## Data Models

See [`../docs/DATABASE_SCHEMA.md`](../docs/DATABASE_SCHEMA.md) for proposed `Product Relationships` and `Recommendation History` collection schemas.
