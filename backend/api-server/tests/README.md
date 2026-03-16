# TradeFlow API Tests

This folder defines the testing strategy for TradeFlow API.

## Strategy

- Unit tests: isolate service, utility, and validation logic.
- Integration tests: validate route + middleware + repository behavior with test fixtures.
- Contract checks: keep endpoint responses aligned with `docs/openapi.yaml`.

## Coverage Target

- Minimum 80% line coverage for the TradeFlow API backend before release.

## Commands

Current enforced quality commands:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Planned additions:

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:coverage`
