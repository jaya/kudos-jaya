# Testing Strategy

This document outlines the testing approach for Kudos Jaya, covering unit tests, integration tests, and test organization.

## Test Framework

- **Jest** with TypeScript support (ts-jest preset)
- **Module mocking** for dependency isolation
- **AsyncLocalStorage** mocking for RequestContext

## Test Organization

Tests are organized in two patterns:

### 1. Feature-Based (Recommended)

```
src/features/kudos/
├── __tests__/
│   ├── handlers/
│   │   ├── slack/
│   │   │   ├── give-kudos-command.test.ts
│   │   │   └── give-kudos-view.test.ts
│   │   └── google-chat/
│   │       └── give-kudos-command.test.ts
│   └── give-kudos.service.test.ts
├── handlers/
├── services/
└── ui/
```

### 2. Layer-Based (Legacy)

```
src/controllers/test/
├── wallet.test.ts
├── recognition.test.ts
└── installation.test.ts
```

New tests should follow the feature-based pattern.

## Unit Tests

Test services, controllers, utilities in isolation using mocks.

### Service Tests

```typescript
import { GiveKudosService } from '../../../services/give-kudos.service';

jest.mock('@/controllers/recognition');
jest.mock('@/utils/logger');

describe('GiveKudosService', () => {
  let service: GiveKudosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GiveKudosService();
  });

  it('should validate monthly limit', async () => {
    const result = await service.validateMonthlyLimit('user1');
    expect(result.canGive).toBe(true);
  });

  it('should handle validation errors', async () => {
    // Test error path
  });
});
```

**Key Points:**
- Mock external dependencies (controllers, loggers, APIs)
- Test both success and error paths
- Test boundary conditions and edge cases

### Controller Tests

```typescript
import { WalletController } from '../wallet';

jest.mock('typeorm');

describe('WalletController', () => {
  it('should update wallet balance', async () => {
    const controller = new WalletController();
    const result = await controller.updateBalance('user1', 100);
    expect(result.balance).toBe(100);
  });
});
```

## Integration Tests

Test handlers with adapters, handlers with services, full request flows.

### Handler Tests

```typescript
import cancelKudosCommandHandler from '../../../handlers/slack/cancel-kudos-command';
import { CancelKudosService } from '../../../services/cancel-kudos.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../../services/cancel-kudos.service');
jest.mock('@/context/RequestContext');

describe('cancelKudosCommandHandler', () => {
  let mockAdapter: any;
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAdapter = {
      openModal: jest.fn().mockResolvedValue(undefined),
      postMessage: jest.fn().mockResolvedValue(undefined),
    };

    mockService = {
      getUserKudos: jest.fn(),
    };

    (CancelKudosService as jest.Mock).mockImplementation(() => mockService);
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });
  });

  it('should open modal when kudos exist', async () => {
    mockService.getUserKudos.mockResolvedValue([
      { id: 1, toId: 'user2' },
    ]);

    await cancelKudosCommandHandler({
      ack: jest.fn(),
      body: { user_id: 'user1' },
    });

    expect(mockAdapter.openModal).toHaveBeenCalled();
  });
});
```

**Key Points:**
- Mock RequestContext with adapter instance
- Mock services to control behavior
- Verify adapter method calls for side effects
- Test both success and error flows

### End-to-End Integration Tests

Test full flows: handler → service → controller → database (with mocks for external APIs).

```typescript
describe('Kudos Flow (Integration)', () => {
  it('should complete full kudos workflow', async () => {
    // Setup: Create users, mock external APIs
    
    // Execute: Run full handler flow
    const result = await giveKudosViewHandler({
      userId: 'user1',
      formData: { to_ids: ['user2'], message: 'Great work!' },
    });

    // Verify: Check all side effects
    expect(mockAdapter.postMessage).toHaveBeenCalled();
    expect(mockService.createRecognitions).toHaveBeenCalled();
  });
});
```

## Mocking Patterns

### Mocking RequestContext

```typescript
jest.mock('@/context/RequestContext');

const mockAdapter = {
  postMessage: jest.fn().mockResolvedValue({ ts: 'msg123', channel: 'ch123' }),
  openModal: jest.fn().mockResolvedValue(undefined),
};

(RequestContext.get as jest.Mock).mockReturnValue({
  adapter: mockAdapter,
  teamId: 'team123',
  userId: 'user1',
});
```

### Mocking Services

```typescript
jest.mock('../services/give-kudos.service');

const mockService = {
  validateMonthlyLimit: jest.fn(),
  fetchGif: jest.fn(),
};

(GiveKudosService as jest.Mock).mockImplementation(() => mockService);
```

### Mocking External APIs

```typescript
jest.mock('@/clients/giphy');

const GiphyClient = require('@/clients/giphy');
GiphyClient.fetchGif.mockResolvedValue('https://example.com/gif.gif');
```

## Test Coverage

### Current Coverage

- **Statements:** 100% on tested files
- **Branches:** 100% on tested files
- **Functions:** 100% on tested files
- **Lines:** 100% on tested files

### Coverage Requirements

- New code must maintain 100% coverage
- Excluded from coverage:
  - `index.ts` files (re-exports)
  - `app.ts` (bootstrap code)
  - `migrations/**` (database migrations)

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- src/features/kudos/__tests__/give-kudos.service.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# With verbose output
npm test -- --verbose
```

## Best Practices

### Do's ✅

- Test behavior, not implementation
- Test error paths and edge cases
- Use descriptive test names
- Mock at system boundaries (APIs, databases)
- Keep tests focused and independent
- Use `beforeEach` for common setup

### Don'ts ❌

- Don't test internal implementation details
- Don't mock the code under test
- Don't create interdependent tests
- Don't skip error path testing
- Don't use `any` types in tests

## Test Data

Use realistic test data that matches production scenarios:

```typescript
const mockKudos = {
  id: 1,
  fromId: 'user1',
  toId: 'user2',
  message: 'Great work on the refactor!',
  createdAt: new Date('2026-08-20'),
  companyValues: ['Innovation', 'Teamwork'],
};
```

## Adding Tests to Existing Features

1. Create `src/features/feature-name/__tests__/` directory
2. Create test file matching handler/service structure
3. Follow mocking patterns above
4. Run tests: `npm test -- <new-test-file>`
5. Ensure 100% coverage on your code
6. Commit with test files

## Common Test Failures

**"Cannot read properties of undefined (reading 'get')"**
- Mock RequestContext.get() in beforeEach

**"Jest worker exited with code 1"**
- Check for infinite loops in mocks
- Verify all async operations resolve

**"Coverage below 100%"**
- Run with `--coverage` to see gaps
- Ensure all branches and error paths are tested

## Continuous Integration

Tests run automatically on:
- Pull request creation
- Before every commit (via husky)
- CI/CD pipeline on push to main

All tests must pass before merging to main.
