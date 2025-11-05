# Tasks: Core E-commerce

**Input**: Design documents from `/specs/001-core-ecommerce/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as requested in the constitution check (TDD approach).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Web PWA**: `web/src/` for React components and logic
- **Shared**: `shared/` for common types and utilities
- **Firebase**: `firebase/` for backend functions and rules
- **Tests**: `web/tests/` for web app tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan
- [X] T002 Initialize TypeScript React PWA project with Firebase dependencies
- [X] T003 [P] Configure Jest testing framework and test utilities
- [X] T004 [P] Setup Firebase project configuration and environment variables
- [X] T005 [P] Create PWA manifest and service worker structure
- [X] T006 [P] Configure TypeScript paths and build pipeline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Setup Firebase Firestore database schema and security rules
- [X] T008 [P] Implement Firebase Authentication service in shared/services/auth.ts
- [X] T009 [P] Create shared type definitions in shared/types/index.ts
- [X] T010 [P] Setup API client with Firebase integration in shared/services/api.ts
- [X] T011 [P] Implement error handling and logging utilities in shared/utils/
- [X] T012 [P] Configure analytics tracking infrastructure in shared/services/analytics.ts
- [X] T013 Create base database indexes for core entities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Customer Purchases Product (Priority: P1) 🎯 MVP

**Goal**: Enable complete e-commerce purchase flow from product browsing to order confirmation

**Independent Test**: Can be fully tested by browsing catalog, adding to cart, and completing payment, delivering immediate shopping value.

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Contract test for product catalog API in web/tests/contract/test-products-api.ts
- [X] T015 [P] [US1] Contract test for cart operations API in web/tests/contract/test-cart-api.ts
- [X] T016 [P] [US1] Contract test for checkout API in web/tests/contract/test-checkout-api.ts
- [X] T017 [P] [US1] Integration test for complete purchase flow in web/tests/integration/test-purchase-flow.ts

### Implementation for User Story 1

- [X] T018 [P] [US1] Create Product model in shared/models/product.ts
- [X] T019 [P] [US1] Create Category model in shared/models/category.ts
- [X] T020 [P] [US1] Create Cart/CartItem models in shared/models/cart.ts
- [X] T021 [P] [US1] Create Order/OrderItem models in shared/models/order.ts
- [X] T022 [US1] Implement ProductService in shared/services/productService.ts
- [X] T023 [US1] Implement CartService in shared/services/cartService.ts
- [X] T024 [US1] Implement OrderService in shared/services/orderService.ts
- [X] T025 [P] [US1] Create product catalog components in web/src/components/catalog/
- [X] T026 [P] [US1] Create product detail component in web/src/components/product/ProductDetail.tsx
- [X] T027 [P] [US1] Create cart components in web/src/components/cart/
- [X] T028 [P] [US1] Create checkout components in web/src/components/checkout/
- [X] T029 [US1] Implement product catalog page in web/src/pages/Catalog.tsx
- [X] T030 [US1] Implement product detail page in web/src/pages/ProductDetail.tsx
- [X] T031 [US1] Implement cart page in web/src/pages/Cart.tsx
- [X] T032 [US1] Implement checkout page in web/src/pages/Checkout.tsx
- [X] T033 [US1] Integrate Mercado Pago payment processing in shared/services/paymentService.ts
- [X] T034 [US1] Integrate Melhor Envio shipping calculations in shared/services/shippingService.ts
- [X] T035 [US1] Add purchase analytics tracking in web/src/analytics/purchaseEvents.ts
- [X] T036 [US1] Add validation and error handling for purchase flow
- [X] T037 [US1] Add offline cart functionality with service worker sync

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Admin Manages Products (Priority: P2)

**Goal**: Provide admin interface for product catalog management

**Independent Test**: Can be fully tested by creating, modifying, and deleting products, ensuring catalog management works.

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] Contract test for admin product management API in web/tests/contract/test-admin-products-api.ts
- [X] T039 [P] [US2] Integration test for admin product workflow in web/tests/integration/test-admin-workflow.ts

### Implementation for User Story 2

- [X] T040 [P] [US2] Create admin role validation in shared/services/authService.ts
- [X] T041 [P] [US2] Create admin product management components in web/src/components/admin/products/
- [X] T042 [P] [US2] Create admin dashboard layout in web/src/components/admin/AdminLayout.tsx
- [X] T043 [US2] Implement admin product list page in web/src/pages/admin/ProductList.tsx
- [X] T044 [US2] Implement admin product create/edit page in web/src/pages/admin/ProductForm.tsx
- [X] T045 [US2] Add inventory management functionality in shared/services/inventoryService.ts
- [X] T046 [US2] Add admin analytics tracking in web/src/analytics/adminEvents.ts
- [X] T047 [US2] Add bulk product operations support

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Customer Discovers Products via Feed (Priority: P2)

**Goal**: Provide Instagram-style personalized product feed with social interactions

**Independent Test**: Can be fully tested by scrolling feed, interacting with products (like, share, save, comment), and seeing personalized recommendations.

### Tests for User Story 4 ⚠️

- [ ] T048 [P] [US4] Contract test for feed API in web/tests/contract/test-feed-api.ts
- [ ] T049 [P] [US4] Contract test for social interactions API in web/tests/contract/test-social-api.ts
- [ ] T050 [P] [US4] Integration test for feed discovery flow in web/tests/integration/test-feed-discovery.ts

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create ProductLike model in shared/models/productLike.ts
- [ ] T052 [P] [US4] Create FeedInteraction model in shared/models/feedInteraction.ts
- [ ] T053 [P] [US4] Create ProductComment model in shared/models/productComment.ts
- [ ] T054 [P] [US4] Create ProductShare model in shared/models/productShare.ts
- [ ] T055 [P] [US4] Create Wishlist model in shared/models/wishlist.ts
- [ ] T056 [US4] Implement FeedService with personalization algorithm in shared/services/feedService.ts
- [ ] T057 [US4] Implement SocialService for likes/comments/shares in shared/services/socialService.ts
- [ ] T058 [US4] Implement WishlistService in shared/services/wishlistService.ts
- [ ] T059 [P] [US4] Create feed components with infinite scroll in web/src/components/feed/
- [ ] T060 [P] [US4] Create social interaction components in web/src/components/social/
- [ ] T061 [P] [US4] Create wishlist components in web/src/components/wishlist/
- [ ] T062 [US4] Implement feed page in web/src/pages/Feed.tsx
- [ ] T063 [US4] Implement feed personalization algorithm in shared/algorithms/feedAlgorithm.ts
- [ ] T064 [US4] Add collaborative filtering logic in shared/algorithms/collaborativeFiltering.ts
- [ ] T065 [US4] Add feed analytics tracking in web/src/analytics/feedEvents.ts
- [ ] T066 [US4] Add push notifications for social interactions in web/src/services/notificationService.ts
- [ ] T067 [US4] Optimize feed performance with virtual scrolling

**Checkpoint**: At this point, User Stories 1, 2, AND 4 should all work independently

---

## Phase 6: User Story 3 - Customer Manages Account (Priority: P3)

**Goal**: Enable user account management and order history tracking

**Independent Test**: Can be fully tested by registering, logging in, and viewing order history.

### Tests for User Story 3 ⚠️

- [ ] T068 [P] [US3] Contract test for user account API in web/tests/contract/test-user-api.ts
- [ ] T069 [P] [US3] Integration test for account management flow in web/tests/integration/test-account-flow.ts

### Implementation for User Story 3

- [ ] T070 [P] [US3] Create User model in shared/models/user.ts
- [ ] T071 [US3] Implement UserService in shared/services/userService.ts
- [ ] T072 [P] [US3] Create authentication components in web/src/components/auth/
- [ ] T073 [P] [US3] Create account management components in web/src/components/account/
- [ ] T074 [US3] Implement login/register page in web/src/pages/auth/Auth.tsx
- [ ] T075 [US3] Implement account profile page in web/src/pages/account/Profile.tsx
- [ ] T076 [US3] Implement order history page in web/src/pages/account/OrderHistory.tsx
- [ ] T077 [US3] Add profile analytics tracking in web/src/analytics/profileEvents.ts
- [ ] T078 [US3] Add mobile app detection functionality in web/src/hooks/useAppInstalled.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T079 [P] Implement comprehensive analytics dashboard in web/src/components/analytics/
- [ ] T080 [P] Add LangChain AI product descriptions in shared/services/aiService.ts
- [ ] T081 [P] Integrate NanoBanana automated banners in web/src/components/banners/
- [ ] T082 [P] Add SEO optimization and blog functionality in web/src/pages/blog/
- [ ] T083 [P] Implement chatbot with WhatsApp handoff in web/src/components/chat/
- [ ] T084 [P] Add flash sales with countdown timers in web/src/components/sales/
- [ ] T085 [P] Add GA4, Meta Pixel, and CAPI tracking in web/src/analytics/external/
- [ ] T086 [P] Implement review system in web/src/components/reviews/
- [ ] T087 [P] Add email notification system in shared/services/emailService.ts
- [ ] T088 Code cleanup and performance optimization across all components
- [ ] T089 [P] Add comprehensive unit tests in web/tests/unit/
- [ ] T090 Security hardening and GDPR compliance implementation
- [ ] T091 Run quickstart.md validation and documentation updates
- [ ] T092 [P] Add end-to-end tests with Cypress in web/tests/e2e/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P4 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before components/pages
- Core implementation before integration features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for product catalog API in web/tests/contract/test-products-api.ts"
Task: "Contract test for cart operations API in web/tests/contract/test-cart-api.ts"
Task: "Contract test for checkout API in web/tests/contract/test-checkout-api.ts"
Task: "Integration test for complete purchase flow in web/tests/integration/test-purchase-flow.ts"

# Launch all models for User Story 1 together:
Task: "Create Product model in shared/models/product.ts"
Task: "Create Category model in shared/models/category.ts"
Task: "Create Cart/CartItem models in shared/models/cart.ts"
Task: "Create Order/OrderItem models in shared/models/order.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo
5. Add User Story 3 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Purchase Flow)
   - Developer B: User Story 2 (Admin Management)
   - Developer C: User Story 4 (Social Feed)
   - Developer D: User Story 3 (Account Management)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence