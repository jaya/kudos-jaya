# Architecture Decision Records

This document records key architectural decisions for Kudos Jaya, including the rationale and consequences of each decision.

## ADR-001: Adapter Pattern for Platform Abstraction

### Decision

Use the **Adapter Pattern** to abstract platform-specific functionality behind a common interface. All handlers interact with platforms through a `PlatformAdapter` instead of directly using Slack SDK or other platform SDKs.

### Context

Originally, handlers directly imported and used the Slack SDK (`@slack/bolt`). This created tight coupling between business logic and Slack, making it difficult to:
- Add support for other platforms (Google Chat, Teams, Discord)
- Test handlers without Slack SDK mocks
- Reuse services across platforms

### Solution

Create a `PlatformAdapter` interface with platform-agnostic methods:

```typescript
interface PlatformAdapter {
  postMessage(params: { channel: string; text: string; blocks?: any[] }): Promise<{ ts: string; channel: string }>;
  openModal(params: { triggerId: string; view: any }): Promise<void>;
  updateModal(params: { viewId: string; view: any }): Promise<void>;
  postEphemeral(params: { channel: string; user: string; text: string }): Promise<void>;
  // ... more methods
}
```

Implement once per platform:
- `SlackAdapter` - Wraps Slack SDK
- `GoogleChatAdapter` - Wraps Google Chat API

### Consequences

✅ **Pros:**
- Handlers work with any platform without changes
- Adding new platforms requires only a new adapter implementation
- Testable: mock adapter instead of SDK
- Clear separation between platform logic and business logic

⚠️ **Cons:**
- Initial overhead to create adapter interface
- Need to keep adapter interface synchronized across implementations
- Some platform-specific features may not fit the abstraction

### Related

See `src/adapters/interfaces/platform-adapter.ts` for interface definitions.

---

## ADR-002: RequestContext for Dependency Injection

### Decision

Use **RequestContext** with `AsyncLocalStorage` to pass request-scoped dependencies (adapter, teamId, userId) without manual parameter threading through all function calls.

### Context

Early versions passed `teamId`, `botToken`, and `client` through 100+ function call sites. This created:
- Parameter clutter at every function
- Risk of accidentally using wrong tenant's data
- Difficult to add new request-scoped values

### Solution

Create a `RequestContext` class using Node's `AsyncLocalStorage`:

```typescript
const contextStorage = new AsyncLocalStorage<RequestContextData>();

class RequestContext {
  static runAsync(context: RequestContext, fn: () => Promise<void>) {
    return contextStorage.run(context, fn);
  }

  static get(): RequestContext {
    return contextStorage.getStore();
  }
}
```

Handlers wrap with `withRequestContext()` which initializes context:

```typescript
const handler = withRequestContext(async ({ ack, body }) => {
  const { adapter, teamId, userId } = RequestContext.get();
  // Use adapter and IDs without passing them
});
```

### Consequences

✅ **Pros:**
- Clean function signatures (no parameter threading)
- Type-safe: RequestContext guarantees teamId/adapter availability
- Automatic multi-tenant safety (each async flow has own context)
- Easy to add new request-scoped values

⚠️ **Cons:**
- Implicit dependencies (harder to see what functions need)
- Debugging requires understanding AsyncLocalStorage
- Context must be initialized before handler execution

### Related

See `src/context/RequestContext.ts` and `src/context/handler-context.ts`.

---

## ADR-003: Feature-Based Directory Structure

### Decision

Organize code by **feature** (cancel-kudos, wallet-report, etc.) rather than by **layer** (handlers, services, controllers).

### Context

Initial structure was layer-based:
```
src/
├── handlers/
├── services/
├── controllers/
└── types/
```

This made it hard to:
- Find all code related to one feature
- Scope-limit changes to one feature
- Understand feature dependencies

### Solution

Organize by feature:
```
src/features/cancel-kudos/
├── handlers/
│   ├── slack/
│   ├── google-chat/
│   └── index.ts
├── services/
│   └── cancel-kudos.service.ts
├── ui/
│   ├── slack/
│   ├── google-chat/
│   └── index.ts
├── __tests__/
└── types/
```

### Consequences

✅ **Pros:**
- All feature code in one place
- Easy to add new features (copy template folder)
- Easier to find related code
- Simpler to measure feature complexity

⚠️ **Cons:**
- Shared utilities need central location (`src/utils/`)
- Cross-feature logic requires careful refactoring
- Deep nesting for large features

### Related

See `src/features/` directory structure.

---

## ADR-004: Type Organization with Domain Boundaries

### Decision

Separate types into **domains** (business logic), **platforms** (Slack-specific), and **APIs** (HTTP interfaces).

### Structure

```
src/types/
├── domain/              # Business logic types
│   ├── recognition.ts   # Kudos sent/received
│   ├── wallet.ts        # User balance
│   └── installation.ts   # Workspace config
├── slack/               # Slack SDK types
│   ├── block-kit.ts     # Block types
│   └── events.ts        # Slack events
├── api/                 # HTTP request/response
│   ├── installation.ts
│   └── user.ts
└── errors/              # Error types
    └── app-error.ts
```

### Rationale

- **Domain types** are used in services (platform-agnostic)
- **Slack types** only used in handlers and adapters
- **API types** separate HTTP concerns from business logic
- Clear dependencies: domain ← never → platform

### Consequences

✅ **Pros:**
- Prevents accidental Slack coupling in services
- Clear dependency flow
- Types match business domain semantics

⚠️ **Cons:**
- More type files to maintain
- Similar types in different domains
- Refactoring requires moving types carefully

### Related

See `src/types/` directory.

---

## ADR-005: Handler Pattern with Service Delegation

### Decision

**Handlers** are thin wrappers that:
1. Acknowledge Slack request immediately
2. Get adapter from RequestContext
3. Delegate to service layer
4. Use adapter for side effects

**Services** contain all business logic and are platform-agnostic.

### Pattern

```typescript
const handler = withRequestContext(async ({ ack, body }: any) => {
  await ack(); // 1. Acknowledge immediately

  const adapter = RequestContext.get().adapter; // 2. Get adapter
  const service = new GiveKudosService(); // 3. Create service
  const result = await service.validateMonthlyLimit(userId); // 4. Delegate

  if (result.canGive) {
    await adapter.postMessage({ /* ... */ }); // 5. Use adapter for side effects
  }
});
```

### Rationale

- Handlers are simple and testable
- Services are reusable across platforms
- Adapter abstraction is at the right layer
- Error handling at handler level prevents leaked adapter errors

### Consequences

✅ **Pros:**
- Clean separation of concerns
- Easy to test handlers and services independently
- Services are truly platform-agnostic
- Consistent pattern across all features

⚠️ **Cons:**
- Service layer must not use platform-specific types
- Requires adapter for every side effect
- Service→Service calls need careful dependency management

### Related

See examples: `src/features/cancel-kudos/handlers/slack/cancel-kudos-command.ts` and `src/features/cancel-kudos/services/cancel-kudos.service.ts`.

---

## ADR-006: Database Abstraction with TypeORM

### Decision

Use **TypeORM** as database abstraction layer with entities, controllers, and migrations.

### Structure

- **Entities** in `src/entities/` - ORM schema definitions
- **Controllers** in `src/controllers/` - Database access layer
- **Migrations** in `src/migrations/` - Schema versioning

### Rationale

- Type-safe database access
- Automatic schema migration management
- Decouples business logic from database
- Support for multiple databases (PostgreSQL, MySQL, etc.)

### Related

See `src/entities/`, `src/controllers/`, and `npm run migration:*` commands.

---

## Decision Review Process

When considering architectural changes:

1. **Document the decision** - Create a new ADR
2. **Discuss rationale** - Get team consensus
3. **Implement with tests** - Prove it works
4. **Update this document** - Add to the record
5. **Migrate existing code** - Refactor legacy patterns (if needed)

## Questions?

Review the architecture decision that applies to your change, and follow the established pattern. When in doubt, open an issue for discussion.
