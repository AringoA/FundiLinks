# Shamba Direct API: Spec Review (Group 14)

 Below are three specific questions, each pointing at a field or endpoint.

## Three questions for the partner

### 1. `PUT /api/orders/{id}`, the `status` field

The enum is `pending / confirmed / delivered / cancelled`, but nothing says which transitions are allowed. Can a `delivered` order go back to `pending`? The only documented 400 is an invalid enum value.

It also doesn't say whether `POST /api/orders` reduces the product's `quantity_kg`, or whether `cancelled` restores it.

**Why it matters:** without these rules I can't write a "bad transition" test case.

### 2. Inconsistent number types: `totalPrice` and `averageRating`

- `POST /api/orders` returns `totalPrice` as a number (`2250`), but the `Order` schema's `total_price` is a string (`"2250.00"`).
- `averageRating` on `GET /api/ratings?farmerId=` is a string like `"4.5"`, except when a farmer has no ratings, where it is the number `0`.

Which types should a consumer rely on?

**Why it matters:** jest assertions (`toBe(2250)` vs `toBe("2250.00")`) depend on the answer.

### 3. Validation on the PUT endpoints

- `PUT /api/products/{id}` documents only 404 and 500, with no 400. What happens with `pricePerKg: -5` or `status: "banana"`? `ProductInput` says an invalid status returns 500. Is that intentional or a bug?
- `PUT /api/headquarters/{id}` reuses `HeadquartersInput`, which requires `regionName` and `county`, but the request body is marked `required: false`. Is it a partial update or a full replace? Products got a separate patch schema (`ProductPatchInput`) to avoid exactly this confusion.

## Smaller things to keep in mind

- `GET /api/products/{id}` increments `views` on every call, so `views` can't be asserted on across repeated calls.
- Delete endpoints for products and users document only 200/404/500. Deleting one that has existing orders isn't covered, and it may be a foreign-key 500.

