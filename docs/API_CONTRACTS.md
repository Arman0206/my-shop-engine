# API Contracts — core-service (Port 5001)

Owned by: Arman
Base URL: `http://localhost:5001`

---

## Product APIs

### Create Product
`POST /products`

Request body:
```json
{
  "productName": "Laptop",
  "category": "Electronics",
  "brand": "Dell",
  "price": 60000,
  "rating": 4.5
}
```

Response (201):
```json
{
  "_id": "66f8a1b2c3d4e5f678901234",
  "productName": "Laptop",
  "category": "Electronics",
  "brand": "Dell",
  "price": 60000,
  "rating": 4.5,
  "createdAt": "2026-07-07T12:00:00.000Z",
  "__v": 0
}
```

### Get All Products
`GET /products`

Response (200): Array of product objects (same shape as above).

### Get Product By ID
`GET /products/:id`

Response (200): Single product object, or 404 if not found.

### Update Product
`PUT /products/:id`

Request body: any subset of product fields to update.

Response (200): Updated product object, or 404 if not found.

### Delete Product
`DELETE /products/:id`

Response (200):
```json
{ "message": "Product deleted" }
```

---

## Cart APIs

### Add Item to Cart
`POST /cart`

Request body:
```json
{
  "userId": "user123",
  "productId": "66f8a1b2c3d4e5f678901234",
  "quantity": 2
}
```

Response (201):
```json
{
  "_id": "66f8b2c3d4e5f6789012345",
  "userId": "user123",
  "productId": "66f8a1b2c3d4e5f678901234",
  "quantity": 2,
  "createdAt": "2026-07-07T12:05:00.000Z",
  "__v": 0
}
```

### Get Cart Items For a User
`GET /cart?userId=user123`

Response (200): Array of cart items, with `productId` populated with full product details:
```json
[
  {
    "_id": "66f8b2c3d4e5f6789012345",
    "userId": "user123",
    "productId": {
      "_id": "66f8a1b2c3d4e5f678901234",
      "productName": "Laptop",
      "category": "Electronics",
      "brand": "Dell",
      "price": 60000,
      "rating": 4.5
    },
    "quantity": 2,
    "createdAt": "2026-07-07T12:05:00.000Z"
  }
]
```

**Note for recommendation-service:** since `productId` is populated here, this endpoint is the easiest way to get a user's current cart contents along with full product info in a single call — useful for `coreServiceClient.js`.

### Remove Item From Cart
`DELETE /cart/:id`

Response (200):
```json
{ "message": "Item removed from cart" }
```

---

## Error Responses

All errors follow this shape:
```json
{ "message": "Description of the error" }
```
Common status codes: `400` (bad request / missing field), `404` (not found), `500` (server error).

---

## For recommendation-service (Student 3)

To get product details for scoring: `GET http://localhost:5001/products/:id` or `GET http://localhost:5001/products`

To get a user's cart contents: `GET http://localhost:5001/cart?userId=<userId>`


---

## Auth APIs (added)

### Register / Login
`POST /auth/register` `{ "email", "password" (8-72 bytes), "name"? }` -> 201 `{ token, user }` (409 if the email exists)
`POST /auth/login` `{ "email", "password" }` -> 200 `{ token, user }` (401 on bad credentials)
`GET /auth/me` -> current user. Send `Authorization: Bearer <token>` on all protected routes.

## Changes to existing APIs

- **Cart (all routes need a token).** `userId` is taken from the token; any `userId` in the body or query is ignored. `POST /cart` now upserts: it returns 201 for a new row and 200 when it incremented an existing one. `DELETE /cart/:id` only removes the caller's own rows (404 otherwise). `GET /cart/popularity` is admin-only.
- **Products.** `POST`/`PUT`/`DELETE` require an admin token. Reads stay public.
- `POST /products/:id/view` -> `{ _id, views }` — atomically increments the view counter (rate-limited).
- `GET /products/:id/candidates?limit=200&maxPriceRatio=2&sameCategory=false` — products to score for recommendations, filtered and capped in MongoDB; excludes the product itself and the `embedding` field.
- Malformed ids return 400 (previously 500); duplicate keys return 409.

## recommendation-service (Port 5002)

`GET /api/recommendations/:productId` — requires a token. 400 invalid id, 401 no/invalid token, 404 unknown product, 429 rate limited, 502 core-service unavailable, 500 anything else.
