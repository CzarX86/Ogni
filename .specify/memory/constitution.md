# Ogni Constitution

## Core Principles

### I. Ecommerce-First
Every feature starts as part of the ecommerce core; Features must integrate with Firebase Firestore, Storage, React 18+, React Native, Mercado Pago SDK, and Melhor Envio API; Clear business purpose required - no features without direct ecommerce value.

### II. TypeScript Standards
All code uses TypeScript 5.x with standard conventions; Strict typing enforced, no any types; Integrates with Firebase SDK and React for type-safe development.

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Use npm test for unit and integration tests.

### IV. Integration Testing
Focus areas requiring integration tests: Firebase Firestore/Storage interactions, Mercado Pago payments, Melhor Envio shipping, React Native mobile features, LangChain AI integrations.

### V. Observability
Use Firebase for logging and monitoring; Structured logging required for all services; Ensure debuggability in production ecommerce environment.

### VI. Versioning & Breaking Changes
Follow semantic versioning (MAJOR.MINOR.PATCH); Breaking changes require migration plans; Align with Firebase SDK updates and API changes.

### VII. Simplicity
Start simple, YAGNI principles; Avoid over-engineering; Prioritize React 18+ features and Firebase NoSQL efficiency.

## Additional Constraints
Technology stack: TypeScript 5.x + Firebase SDK, React 18+, React Native, LangChain, Mercado Pago SDK, Melhor Envio API. Project structure: src/ for code, tests/ for tests. Commands: npm test && npm run lint. Code style: Follow TypeScript standard conventions. Security: Protect API keys in .env.local, use Firebase Auth for user management.

## Development Workflow
Code review requirements: All PRs must pass npm test && npm run lint, verify constitution compliance. Testing gates: Integration tests for ecommerce features. Deployment: Use Firebase hosting, ensure mobile compatibility with React Native.

## Governance
Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan. All PRs/reviews must verify compliance; Complexity must be justified; Use development guidelines for runtime guidance.

**Version**: 1.0 | **Ratified**: 2024-10-01 | **Last Amended**: 2024-10-01
