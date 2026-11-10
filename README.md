# Smart Cart Optimization Engine

**Keywords:** e-commerce, recommendation systems, semantic embeddings, transformer models, cosine similarity, hybrid scoring, large language models, microservices, MongoDB, retrieve-then-explain pipelines.

---

## Abstract

Online retail platforms increasingly rely on **cross-sell recommendation** to raise average order value, but naive similarity-only engines surface suggestions that are semantically related yet commercially irrelevant, while manually curated rule sets do not scale across large catalogs. This repository implements an **end-to-end microservices pipeline** that

1. Represents each product as a dense vector via a locally-run **sentence-transformer** (`Xenova/all-MiniLM-L6-v2`, ONNX runtime, no external inference cost);
2. Combines **cosine similarity** with three deterministic business signals — rating, price compatibility, and view-based popularity — into a single weighted score per candidate product;
3. Ranks candidates and selects the **top-5** by score;
4. Delegates natural-language justification to a **large language model** (Google Gemini) via a single batched prompt per request, with a prioritized model fallback chain for resilience; and
5. Serves the resulting ranked, explained list through a stateless REST API consumed by a React frontend.

The design emphasizes **separation of concerns**: the recommendation pipeline never writes to the shared database, all similarity computation happens in-process without external ML infrastructure, and the LLM is used strictly as a explanation layer over pre-computed, deterministic scores — never as the source of the ranking itself.

---

## 1. Motivation and Problem Statement

E-commerce platforms want customers to purchase more than one item per order, but customers typically leave with only the single product they came for — even when relevant, complementary items exist elsewhere in the catalog (a shopper adding a laptop who would plausibly also want a mouse, a bag, or a keyboard).

Three requirements follow from this gap:

1. **Automatic relevance discovery** — candidate products must be identified from unstructured text (name, category, brand, description) without hand-authored rules for every product pair.
2. **Commercial soundness** — semantic relatedness alone is insufficient; a recommendation must also be affordable relative to the cart, well-rated, and reasonably popular to be worth surfacing.
3. **Interpretability** — a ranked list without justification reads as arbitrary to the shopper; each suggestion needs a short, human-readable reason.

This repository provides a working reference implementation addressing all three requirements as a set of independently deployable services.

---

## 2. System Architecture

### 2.1 Logical Layers

- **Presentation layer.** A React + Vite frontend renders the product catalog, cart, recommendation cards, and an analytics dashboard, calling both backend services directly over HTTP.
- **Core data layer (`core-service`).** An Express + Mongoose API that owns all product and cart data in MongoDB Atlas. This is the single source of truth; no other service writes to it.
- **Recommendation layer (`recommendation-service`).** A stateless Express service that, on request, fetches product data from `core-service`, computes embeddings and scores in-process, ranks candidates, and calls Gemini for reasoning text before returning the combined result.
- **External inference.** Embedding inference runs locally inside the recommendation service process (ONNX Runtime); only the reasoning step calls an external API (Gemini).

### 2.2 Architecture Diagram

```

```

### 2.3 Design Invariant

> *`recommendation-service` never writes to shared state.* It is a pure read-and-compute service: it reads products from `core-service` over HTTP, computes embeddings and scores entirely in-process, and calls Gemini only for text generation over already-ranked candidates. All persistent writes to products and cart data flow exclusively through `core-service`.

---

## 3. Data Sources

| Entity | Owned by | Role | Storage |
|---|---|---|---|
| Products | `core-service` | Name, category, brand, description, price, rating, views — the substrate for both similarity and business-signal scoring | MongoDB Atlas, `Products` collection |
| Cart | `core-service` | Per-user cart entries referencing product IDs | MongoDB Atlas, `Cart` collection |
| View counts | `core-service` (accumulated), read by `recommendation-service` | Popularity proxy used in the scoring formula | `Products.views` field |

Full field-level schemas are documented in [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

---

## 4. Methodology

### 4.1 Embedding Generation

Each product's `productName`, `category`, `brand`, and `description` are concatenated into a single text string (`similarity.service.js: buildProductText`) and passed through `Xenova/all-MiniLM-L6-v2`, loaded once per process (`model.service.js`) and run via `onnxruntime-node`. Mean-pooled, normalized output vectors are cached in-memory by input text (`embedding.service.js`) so repeated requests for the same product skip re-inference.

### 4.2 Similarity Scoring

For two products with embeddings $a$ and $b$, cosine similarity is computed as:

$$\text{sim}(a, b) = \frac{a \cdot b}{\lVert a \rVert \, \lVert b \rVert}$$

implemented directly in `similarity.service.js`, producing a value in $[0, 1]$ for normalized embeddings.

### 4.3 Hybrid Business Scoring

`scoring.service.js` combines four signals into a single score out of 100 for each candidate product relative to the selected product:

| Signal | Weight | Formula |
|---|---|---|
| Semantic similarity | 40 | $\text{sim}(a,b) \times 40$ |
| Rating | 20 | $(\text{rating} / 5) \times 20$ |
| Price compatibility | 10 | $+10$ if $\lvert \text{price}_a - \text{price}_b \rvert \le 1000$, else $0$ |
| Popularity (views) | 30 | $\min\!\big((\text{views}/1000) \times 30,\ 30\big)$ |

The price-compatibility term is a flat bonus rather than a continuous function, keeping the score robust to outlier price differences without requiring normalization against the full catalog's price distribution.

### 4.4 Ranking

`ranking.service.js` sorts all scored candidates in descending order and retains the top 5 — a fixed-size shortlist chosen to keep the downstream LLM prompt small and the frontend recommendation rail compact.

### 4.5 Reason Generation

`prompt.service.js` constructs a single prompt containing the selected product and all 5 ranked candidates with their scores. `llm.service.js` sends this prompt to Gemini, attempting a prioritized list of model versions (`gemini-3.6-flash → gemini-3.5-flash → gemini-2.0-flash → gemini-2.0-flash-lite`) until one succeeds, and parses the response as strict JSON after stripping any markdown code fences. If every model attempt fails, `recommendation.service.js` falls back to a generic similarity-based reason string per product rather than surfacing an error — the pipeline degrades gracefully instead of failing the request.

---

## 5. Infrastructure

### 5.1 Services

| Service | Runtime | Port | Purpose |
|---|---|---|---|
| `frontend` | React 19, Vite | 5173 | Catalog, cart, recommendations, analytics UI |
| `core-service` | Node.js, Express 5, Mongoose | 5001 | Owns products and cart data |
| `recommendation-service` | Node.js, Express 5, `@xenova/transformers`, `onnxruntime-node`, `@google/genai` | 5002 | Embeddings, scoring, ranking, LLM reasoning |
| MongoDB Atlas | Managed cloud MongoDB | — | Shared `smartcart` database |
| Gemini API | Google-hosted LLM | — | Natural-language reason generation |

### 5.2 Inter-Service Communication

`recommendation-service` communicates with `core-service` exclusively through a dedicated HTTP client (`clients/coreServiceClient.js`, built on Axios), exposing two calls: `getAllProducts()` and `getProductById(id)`. No other coupling exists between the two services — they share no code, no in-memory state, and no direct database connection pooling.

### 5.3 Environment Configuration

Each service reads its configuration from its own `.env` file:

| Service | Required variables |
|---|---|
| `core-service` | `PORT`, `MONGO_URI`, `JWT_SECRET` (>= 32 chars), `CORS_ORIGIN` |
| `recommendation-service` | `PORT`, `MONGO_URI`, `CORE_SERVICE_URL`, `GEMINI_API_KEY`, `JWT_SECRET` (identical to core-service), `CORS_ORIGIN` |
| `frontend` | `VITE_CORE_SERVICE_URL`, `VITE_RECOMMENDATION_SERVICE_URL` |

---

### 5.4 Authentication

`core-service` issues HS256 JWTs (`POST /auth/register`, `POST /auth/login`). The frontend sends them as `Authorization: Bearer <token>`; both backends verify them with the shared `JWT_SECRET`. Cart routes act on the authenticated user only, product writes and `/cart/popularity` require the `admin` role (create one with `node scripts/createAdmin.js`), and `recommendation-service` requires a valid token and rate-limits per user. Both services refuse to start without a strong `JWT_SECRET`. Run behind HTTPS in any public deployment.

**Upgrading an existing database:** run `node scripts/dedupeCart.js` (dry run) then `--apply` in `core-service` before deploying, so the new unique `(userId, productId)` cart index can be built. Old carts stored under `guest-user` are not attached to any account.

---

## 6. API Contract Summary

Full request and response examples are documented in [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md).

**`core-service` — `http://localhost:5001`**

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Service status check |
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get a product by ID |
| PUT | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |
| POST | `/cart` | Add an item to a user's cart |
| GET | `/cart?userId=<id>` | Get a user's cart, product details populated |
| GET | `/cart/popularity` | Aggregated cart count per product |
| DELETE | `/cart/:id` | Remove an item from the cart |

**`recommendation-service` — `http://localhost:5002`**

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Service status check |
| GET | `/api/recommendations/:productId` | Returns the selected product and its top-5 ranked, explained recommendations |

---

## 7. Data Model

Full schemas are documented in [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

**Products** — `core-service/src/modules/products/product.model.js`

| Field | Type | Notes |
|---|---|---|
| `productName` | String | Required |
| `description` | String | Required |
| `category` | String | Required |
| `brand` | String | Optional |
| `price` | Number | Required |
| `rating` | Number | Default `0` |
| `views` | Number | Default `0`, popularity signal |
| `embedding` | Array of Number | Reserved for a persisted embedding vector |

**Cart** — `core-service/src/modules/cart/cart.model.js`

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Required |
| `productId` | ObjectId | Required, references `Product` |
| `quantity` | Number | Default `1` |

---

## 8. Experimental Protocol

```
# 1. Clone and configure
git clone https://github.com/Arman0206/smart-cart-optimization-engine.git
cd smart-cart-optimization-engine

# 2. core-service
cd core-service
npm install
# create .env: PORT=5001, MONGO_URI=<connection string>
npm run dev

# 3. recommendation-service (in a separate terminal)
cd recommendation-service
npm install
# create .env: PORT=5002, MONGO_URI=<connection string>,
#              CORE_SERVICE_URL=http://localhost:5001,
#              GEMINI_API_KEY=<key>
npm run dev

# 4. frontend (in a separate terminal)
cd frontend
npm install
# create .env: VITE_CORE_SERVICE_URL=http://localhost:5001,
#              VITE_RECOMMENDATION_SERVICE_URL=http://localhost:5002
npm run dev

# 5. Open the application
# Frontend:   http://localhost:5173
```

Services must be started in this order — `recommendation-service` depends on `core-service` being reachable, and `frontend` depends on both.

---

## 9. Repository Layout

```
smart-cart-optimization-engine/
├── core-service/
│   ├── src/
│   │   ├── server.js                    Entrypoint — connects DB, starts HTTP server
│   │   ├── app.js                       Express app, route mounting, /health
│   │   ├── config/db.js                 MongoDB connection
│   │   ├── middlewares/errorHandler.js  Centralized error handler
│   │   └── modules/
│   │       ├── products/                Product model, service, controller, routes
│   │       └── cart/                    Cart model, service, controller, routes
│   └── package.json
├── recommendation-service/
│   ├── src/
│   │   ├── server.js                             Entrypoint
│   │   ├── app.js                                Express app, /health, route mounting
│   │   ├── config/db.js                          MongoDB connection
│   │   ├── clients/coreServiceClient.js          HTTP client to core-service
│   │   └── modules/recommendations/
│   │       ├── model.service.js                  Loads MiniLM via ONNX Runtime
│   │       ├── embedding.service.js               Generates and caches embeddings
│   │       ├── similarity.service.js              Cosine similarity between products
│   │       ├── scoring.service.js                 Hybrid scoring formula
│   │       ├── ranking.service.js                 Sorts and selects the top 5
│   │       ├── prompt.service.js                  Builds the Gemini prompt
│   │       ├── llm.service.js                     Calls Gemini with a model fallback chain
│   │       ├── reason.service.js                  Orchestrates prompt, LLM call, and reasons
│   │       ├── recommendation.service.js          Orchestrates the full pipeline
│   │       ├── recommendation.controller.js
│   │       └── recommendation.routes.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx, App.jsx            Entrypoint and route definitions
│   │   ├── pages/                       Dashboard, ProductCatalog, CartPage,
│   │   │                                RecommendationsPage, AnalyticsPage
│   │   ├── components/
│   │   │   ├── layout/                  Header, Navbar, Sidebar, Layout
│   │   │   ├── products/ProductCard.jsx
│   │   │   ├── cart/CartItem.jsx
│   │   │   ├── recommendations/RecommendationCard.jsx
│   │   │   └── dashboard/DashboardCard.jsx
│   │   └── services/                    apiClient.js and one service module per domain
│   └── package.json
├── docs/
│   ├── API_CONTRACTS.md                 Full request and response contracts
│   └── DATABASE_SCHEMA.md               MongoDB collection schemas
└── README.md
```

---

## 10. Evaluation and Validity

| Aspect | What to report |
|---|---|
| Similarity quality | Manual inspection of top-5 rankings against a hand-labeled set of expected complementary pairs (e.g., laptop → mouse, bag, keyboard) |
| Scoring behavior | Distribution of scores across the four weighted components for a sample of products, to confirm no single signal dominates unexpectedly |
| LLM reliability | Fallback-chain trigger frequency (how often the primary model fails), and rate of requests falling back to the generic reason string |
| End-to-end latency | Time from request to response, broken down into embedding computation, scoring, and the Gemini call |

**Threats to validity.** Recommendation quality has not yet been validated against real user click-through or add-to-cart data; the price-compatibility threshold (₹1000) and popularity cap are fixed constants rather than tuned per catalog; embeddings are computed from product text only, with no signal from user behavior or co-purchase history.

---

## 11. Limitations and Future Work

- **Single-item scope.** Recommendations are computed against one selected product at a time, not the full cart context; multi-item bundling (combined embeddings across all cart items) is not yet implemented.
- **No user personalization.** Scoring does not currently incorporate a shopper's purchase history or browsing behavior — every request for a given product returns the same ranking regardless of who is asking.
- **In-memory cache only.** The embedding cache (`embedding.service.js`) does not persist across service restarts and does not share state across multiple instances of `recommendation-service`; a persistent vector store would be required to scale horizontally.
- **Fixed scoring weights.** The 40/20/10/30 weighting in `scoring.service.js` is a static configuration rather than learned or A/B-tested against outcome data.
