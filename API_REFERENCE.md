# E-Commerce API Reference

Base URL: `http://localhost:4000` (set `PORT` in `.env`)

## Authentication

| Type | Header |
|------|--------|
| Customer / Staff | `Authorization: Bearer <token>` |

**Login**
```bash
# Customer
curl -X POST http://localhost:4000/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"secret12\"}"

# Admin
curl -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"secret12\"}"
```

---

## Common query parameters (list endpoints)

| Param | Description |
|-------|-------------|
| `page` | Page number (default `1`) |
| `limit` | Items per page (default `20`, max `100`) |
| `sortBy` | Sort field (module-specific) |
| `sortOrder` | `asc` or `desc` |
| `search` / `q` | Text search (ILIKE) |

**Multi-ID filters:** use comma-separated values or repeat param:
- `categoryIds=1,2,3` or `categoryId=1&categoryId=2`

---

## Products — `/api/products`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin + `products` |
| PATCH | `/:id` | Admin + `products` |
| DELETE | `/:id` | Admin + `products` |

**Filters (GET list)**
| Param | Example |
|-------|---------|
| `categoryIds` / `categoryId` | `1,2,3` |
| `brandIds` / `brandId` | `2,5` |
| `isActive` | `true` |
| `isNewArrival` | `true` |
| `isTrending` | `true` |
| `isBestSeller` | `true` |
| `inStock` | `true` |
| `minStock` / `maxStock` | `1` / `100` |
| `minPrice` / `maxPrice` | `500` / `5000` |
| `priceField` | `salePrice` or `basePrice` |
| `metalType` | `gold` |
| `stoneType` | `diamond` |
| `search` | `ring` |

```bash
curl "http://localhost:4000/api/products?categoryIds=1,2&brandIds=3&minPrice=500&maxPrice=5000&isActive=true&page=1&limit=10"
```

---

## Categories — `/api/categories`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin + `categories` |
| PUT | `/:id` | Admin + `categories` |
| DELETE | `/:id` | Admin + `categories` |

**Filters:** `isActive`, `minRank`, `maxRank`, `search`, pagination

```bash
curl "http://localhost:4000/api/categories?isActive=true&search=jewelry&sortBy=rank&sortOrder=asc"
```

---

## Brands — `/api/brands`

Same pattern as categories.

**Filters:** `isActive`, `search`, pagination

---

## Cart — `/api/cart` (customer token)

| Method | Path | Body |
|--------|------|------|
| POST | `/` | `{ "productId", "variantId?", "quantity" }` |
| GET | `/` | — |
| GET | `/:id` | — |
| PATCH | `/:id` | `{ "quantity" }` |
| DELETE | `/:id` | — |
| DELETE | `/clear` | — |

```bash
curl -X POST http://localhost:4000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":1,\"variantId\":2,\"quantity\":1}"
```

---

## Orders — `/api/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/checkout` | Customer | Place order from cart |
| GET | `/` | Customer (own) / Admin + `orders` | List orders |
| GET | `/:id` | Customer (own) / Admin | Order detail + items |
| POST | `/:id/cancel` | Customer (own) / Admin | Cancel order + restore stock |
| PATCH | `/:id` | Admin + `orders` | Update status |
| DELETE | `/:id` | Admin + `orders` | Delete order |

**Checkout body**
```json
{
  "paymentMethod": "cod | gokwik | online",
  "shippingAddressId": 1,
  "billingAddressId": 1,
  "shippingAddress": { "address_line1", "city", "state", "country", "postalCode", "phone" },
  "couponCode": "SAVE10",
  "taxAmount": 0,
  "shippingCost": 50,
  "currency": "INR"
}
```

**Order list filters (admin)**
| Param | Example |
|-------|---------|
| `orderStatus` / `orderStatuses` | `pending` or `pending,confirmed` |
| `paymentStatus` | `paid` |
| `paymentMethod` | `gokwik` |
| `customerId` / `customerIds` | `3` |
| `minTotal` / `maxTotal` | `500` / `10000` |
| `created_atFrom` / `created_atTo` | ISO dates |
| `dateFrom` / `dateTo` | ISO dates |
| `search` | transaction id |

```bash
# Checkout COD
curl -X POST http://localhost:4000/api/orders/checkout \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"paymentMethod\":\"cod\",\"shippingAddressId\":1}"

# Checkout GoKwik
curl -X POST http://localhost:4000/api/orders/checkout \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"paymentMethod\":\"gokwik\",\"shippingAddressId\":1}"

# Cancel order
curl -X POST http://localhost:4000/api/orders/5/cancel \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reason\":\"Changed mind\"}"

# Admin update status
curl -X PATCH http://localhost:4000/api/orders/5 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderStatus\":\"shipped\",\"paymentStatus\":\"paid\"}"
```

**Order statuses:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`  
**Payment statuses:** `pending`, `paid`, `failed`, `refunded`

---

## Payments (GoKwik) — `/api/payments/gokwik`

| Method | Path | Auth |
|--------|------|------|
| GET | `/config` | Public |
| GET | `/webhook` | Public (health check) |
| POST | `/webhook` | GoKwik servers |
| POST | `/success/:orderId` | Customer |

**.env keys:** `GOKWIK_ENABLED`, `GOKWIK_ENV`, `GOKWIK_APP_ID`, `GOKWIK_APP_SECRET`, `GOKWIK_MERCHANT_ID`, `GOKWIK_WEBHOOK_SECRET`, `GOKWIK_MOCK_CHECKOUT`, `APP_URL`, `FRONTEND_URL`

```bash
curl http://localhost:4000/api/payments/gokwik/config
```

---

## Reviews — `/api/reviews`

| Method | Path | Auth |
|--------|------|------|
| GET | `/product/:productId` | Public (approved only) |
| GET | `/` | Public (approved) / Admin (all) |
| GET | `/:id` | Public (approved) / Admin |
| POST | `/` | Customer |
| PATCH | `/:id` | Admin + `reviews` |
| PATCH | `/:id/approve` | Admin + `reviews` |
| DELETE | `/:id` | Admin + `reviews` |

**Create body:** `{ "productId", "orderId?", "rating": 1-5, "title?", "comment?" }`

**Filters:** `productId`, `productIds`, `customerId`, `isApproved`, `isVerifiedPurchase`, `minRating`, `maxRating`, `search`

```bash
# Public product reviews
curl "http://localhost:4000/api/reviews/product/1?page=1&limit=10"

# Submit review (verified if orderId matches delivered/paid order)
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":1,\"orderId\":5,\"rating\":5,\"title\":\"Great\",\"comment\":\"Loved it\"}"

# Admin approve
curl -X PATCH http://localhost:4000/api/reviews/1/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Customers — `/api/customers`

| Method | Path | Auth |
|--------|------|------|
| POST | `/` | Public register OR Admin create |
| GET | `/` | Admin + `customers` |
| GET | `/:id` | Admin |
| PATCH | `/me` | Customer |
| DELETE | `/me` | Customer |
| PATCH | `/:id` | Customer (own) / Admin |
| DELETE | `/:id` | Customer (own) / Admin |

**Filters:** `isVerified`, `search`, pagination

---

## Addresses — `/api/addresses` (customer)

| Method | Path |
|--------|------|
| POST | `/` |
| GET | `/` |
| GET | `/:id` |
| PATCH | `/:id` |
| DELETE | `/:id` |

**Filters:** `address_type`, `search`, pagination (scoped to logged-in customer)

---

## Wishlist — `/api/wishlist` (customer)

| Method | Path | Body |
|--------|------|------|
| POST | `/` | `{ "productId" }` |
| GET | `/` | filters: `productId`, `productIds` |
| GET | `/:id` | |
| DELETE | `/:id` | |

---

## Coupons — `/api/coupons`

| Method | Path | Auth |
|--------|------|------|
| GET | `/validate/:code` | Public |
| GET | `/` | Admin + `coupons` |
| POST/PATCH/DELETE | `/` / `/:id` | Admin |

**Filters:** `isActive`, `discountType`, `search`, pagination

---

## Blogs — `/api/blogs`

**Filters:** `status`, `category`, `isFeatured`, `search`, pagination  
Admin write requires `blog` module.

---

## Newsletters — `/api/newsletters`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public (published) |
| POST | `/subscribe` | Public |
| GET | `/subscribers` | Admin + `newsletter` |
| POST/PATCH/DELETE | `/`, `/:id` | Admin + `newsletter` |

---

## Hero sliders — `/api/hero-sliders`

**Filters:** `isActive`, `minRank`, `maxRank`, `search`, pagination

---

## Instagram reels — `/api/instagram-reels`

**Filters:** `isActive`, `search`, pagination

---

## Product variants — `/api/product-variants`

**Query:** `productId` (public GET)

---

## Product images — `/api/product-images`

Multipart upload; `productId`, optional `variantId`, field `images` or `image`.

---

## Admin permissions — `/api/admin`

| Method | Path | Auth |
|--------|------|------|
| POST | `/create` | Super admin |
| PUT | `/update/:userId` | Super admin |
| GET | `/modules` | Staff |
| GET | `/my-modules` | Staff |

**Module keys:** `products`, `categories`, `brands`, `orders`, `customers`, `reviews`, `coupons`, `blog`, `newsletter`, etc. (see `config/adminModules.js`)

---

## Environment variables (summary)

```env
PORT=4000
JWT_SECRET=
DATABASE_URL=
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# GoKwik
GOKWIK_ENABLED=true
GOKWIK_ENV=SANDBOX
GOKWIK_APP_ID=
GOKWIK_APP_SECRET=
GOKWIK_MERCHANT_ID=
GOKWIK_WEBHOOK_SECRET=
GOKWIK_MOCK_CHECKOUT=true
```

---

## Quick test flow

1. Register customer → `POST /api/customers`
2. Login → `POST /api/auth/customer/login`
3. Add to cart → `POST /api/cart`
4. Add address → `POST /api/addresses`
5. Checkout → `POST /api/orders/checkout`
6. Review → `POST /api/reviews` (after order delivered/paid)
7. Admin approve review → `PATCH /api/reviews/:id/approve`
