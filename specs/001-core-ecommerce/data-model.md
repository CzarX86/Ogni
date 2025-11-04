# Data Model: Core E-commerce

**Date**: November 4, 2025
**Feature**: 001-core-ecommerce

## Entities

### Product
- **id**: string (Firestore document ID)
- **name**: string (required, 1-100 chars)
- **description**: string (required, AI-generated)
- **price**: number (required, >0)
- **images**: array<string> (URLs, at least 1)
- **stock**: number (required, >=0)
- **categoryId**: string (reference to Category)
- **createdAt**: timestamp
- **updatedAt**: timestamp

**Validation**: Name unique per category, price decimal with 2 places, stock integer.

### Category
- **id**: string
- **name**: string (required, unique)
- **description**: string
- **image**: string (URL)
- **parentId**: string (optional, for subcategories)

**Validation**: Name 1-50 chars.

### User
- **id**: string (Firebase Auth UID)
- **email**: string (required, valid email)
- **displayName**: string
- **role**: enum (customer, admin) default customer
- **profile**: object {phone, address}
- **fcmTokens**: array<string> (Firebase Cloud Messaging tokens for push notifications)
- **appInstalled**: boolean (client-side detection of PWA installation)
- **createdAt**: timestamp

**Validation**: Email unique.

### Order
- **id**: string
- **userId**: string (reference to User)
- **items**: array<OrderItem>
- **total**: number (calculated)
- **status**: enum (pending, paid, shipped, delivered, cancelled)
- **shipping**: object {address, method, cost}
- **payment**: object {method, status, transactionId}
- **createdAt**: timestamp
- **updatedAt**: timestamp

**Validation**: Total = sum(items.price * qty), status transitions valid.

### OrderItem
- **productId**: string (reference to Product)
- **quantity**: number (required, >0)
- **price**: number (at purchase time)

### Cart
- **userId**: string (reference to User, or session ID for guests)
- **items**: array<CartItem>
- **createdAt**: timestamp
- **updatedAt**: timestamp

### CartItem
- **productId**: string
- **quantity**: number (>0)

### Review
- **id**: string
- **productId**: string
- **userId**: string
- **rating**: number (1-5)
- **comment**: string (optional)
- **createdAt**: timestamp

**Validation**: One review per user per product.

### PageView
- **id**: string
- **userId**: string (optional, for logged users)
- **sessionId**: string
- **page**: string (URL path)
- **referrer**: string
- **timeOnPage**: number (seconds)
- **timestamp**: timestamp
- **deviceInfo**: object {type, os, browser}

### UserInteraction
- **id**: string
- **userId**: string (optional)
- **sessionId**: string
- **interactionType**: enum (click, scroll, form_submit, search, add_to_cart, etc.)
- **element**: string (CSS selector or element ID)
- **page**: string
- **metadata**: object (additional data like productId, searchTerm)
- **timestamp**: timestamp

### Session
- **id**: string
- **userId**: string (optional)
- **startTime**: timestamp
- **endTime**: timestamp
- **duration**: number (seconds)
- **pageViews**: number
- **deviceInfo**: object
- **source**: string (referrer, campaign, etc.)

### CartEvent
- **id**: string
- **userId**: string (optional)
- **sessionId**: string
- **eventType**: enum (add_item, remove_item, update_quantity, abandon, checkout_start, purchase)
- **productId**: string
- **quantity**: number
- **cartValue**: number
- **timestamp**: timestamp

### ProductLike
- **id**: string
- **userId**: string
- **productId**: string
- **timestamp**: timestamp
- **context**: string (feed, product_page, search)

**Validation**: One like per user per product.

### FeedInteraction
- **id**: string
- **userId**: string (optional)
- **sessionId**: string
- **productId**: string
- **interactionType**: enum (view, like, skip, click, add_to_cart, purchase, share, save)
- **feedPosition**: number (position in feed when interacted)
- **algorithmScore**: number (relevance score used for ranking)
- **timestamp**: timestamp

### ProductComment
- **id**: string
- **userId**: string
- **productId**: string
- **content**: string (comment text, max 500 chars)
- **parentId**: string (optional, for replies)
- **likes**: number (comment likes count)
- **timestamp**: timestamp

**Validation**: Content required, max 500 chars.

### ProductShare
- **id**: string
- **userId**: string
- **productId**: string
- **platform**: enum (whatsapp, telegram, email, copy_link, native_share)
- **timestamp**: timestamp

### Wishlist
- **id**: string
- **userId**: string
- **name**: string (optional, default "My Wishlist")
- **products**: array<string> (product IDs)
- **isPublic**: boolean (default false)
- **createdAt**: timestamp
- **updatedAt**: timestamp

## Relationships

- Product → Category (many-to-one)
- Product ← Review (one-to-many)
- User → Order (one-to-many)
- Order → OrderItem → Product (many-to-many via items)
- User → Cart (one-to-one)
- Cart → CartItem → Product (many-to-many)
- User → PageView (one-to-many)
- User → UserInteraction (one-to-many)
- User → Session (one-to-many)
- Session → PageView (one-to-many)
- Session → UserInteraction (one-to-many)
- User/Cart → CartEvent (one-to-many)
- User → ProductLike (one-to-many)
- ProductLike → Product (many-to-one)
- User/Session → FeedInteraction (one-to-many)
- FeedInteraction → Product (many-to-one)
- User → ProductComment (one-to-many)
- ProductComment → Product (many-to-one)
- ProductComment → ProductComment (one-to-many, for replies)
- User → ProductShare (one-to-many)
- ProductShare → Product (many-to-one)
- User → Wishlist (one-to-many)
- Wishlist → Product (many-to-many)

## State Transitions

### Order Status
- pending → paid (payment successful)
- paid → shipped (admin action)
- shipped → delivered (admin action)
- any → cancelled (user/admin action)

### User Roles
- customer: default, can browse, buy, review
- admin: all customer + manage products, orders, users

## Data Volume Estimates

- Products: 1000+
- Categories: 50+
- Users: 1000+
- Orders: 100/day average
- Reviews: 5000+
- PageViews: 10000+/day
- UserInteractions: 50000+/day
- Sessions: 5000+/day
- CartEvents: 10000+/day
- ProductLikes: 10000+
- FeedInteractions: 50000+/day
- ProductComments: 5000+
- ProductShares: 2000+/day
- Wishlists: 500+

## Indexes Needed

- Products by category
- Orders by user, status
- Reviews by product
- ProductLikes by user, product
- FeedInteractions by user, session, timestamp
- UserInteractions by user, timestamp
- ProductComments by product, timestamp
- ProductShares by product, timestamp
- Wishlists by user