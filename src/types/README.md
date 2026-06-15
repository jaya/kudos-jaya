# Type Organization & Boundaries

This directory contains all TypeScript type definitions for the Kudos Jaya application. Types are organized into logical domains to separate business logic from platform-specific concerns and enable multi-platform support.

## Directory Structure

```
src/types/
├── domain/          # Platform-agnostic business domain types
├── slack/           # Slack platform-specific types
├── api/             # HTTP API request/response types
├── errors/          # Error type definitions
└── index.ts         # Public API exports
```

## Type Categories

### Domain Types (`/domain`)

Business logic types that are **platform-agnostic** and reusable across all platforms (Slack, Google Chat, Discord, Teams, etc.).

**Files:**
- `user.ts` - User entity and user-related parameters
- `wallet.ts` - Wallet and transaction types
- `recognition.ts` - Recognition (kudos) types and gift card handling
- `installation.ts` - Workspace/team installation and configuration
- `product.ts` - Product catalog and gift card redemption

**Usage:**
- Use in all services and business logic
- No Slack/platform knowledge should be present
- Reused by all platform implementations

**Example:**
```typescript
import type { Recognition, GiveKudosParams } from '@/types/domain';

// Services use domain types exclusively
class GiveKudosService {
  async createRecognitions(params: GiveKudosParams): Promise<Recognition[]> {
    // No Slack imports here
  }
}
```

### Slack Types (`/slack`)

**Slack-specific** types that represent Slack data structures and platform concepts.

**Files:**
- `config.ts` - Slack SDK configuration, user/team representations, message structures

**Usage:**
- Use only in Slack handlers and adapters
- Convert to domain types when passing to services
- Must not leak into services or controllers

**Example:**
```typescript
import type { SlackUser } from '@/types/slack';
import type { User } from '@/types/domain';

// Handler converts platform types to domain types
const handler = async ({ body }: SlackCommandMiddlewareArgs) => {
  const slackUser: SlackUser = {
    id: body.user_id,
    name: body.user_name,
  };
  
  const domainUser: User = convertSlackUserToDomainUser(slackUser);
  await service.processUser(domainUser);
};
```

### API Types (`/api`)

HTTP request/response types for REST endpoints and webhook handlers.

**Files:**
- `request.ts` - Query parameters, pagination, filtering
- `response.ts` - Standardized API response formats

**Usage:**
- Use in HTTP controllers and API middleware
- Wrap domain types for JSON serialization
- Ensure structured error responses

**Example:**
```typescript
import type { ApiResponse } from '@/types/api';
import type { Recognition } from '@/types/domain';

// HTTP endpoint wraps domain types
app.get('/recognitions', async (req, res) => {
  const recognitions: Recognition[] = await service.list();
  const response: ApiResponse<Recognition[]> = {
    success: true,
    data: recognitions,
  };
  res.json(response);
});
```

### Error Types (`/errors`)

Standardized error definitions with codes and HTTP status mappings.

**Files:**
- `index.ts` - Error interface, error codes, HTTP status types

**Usage:**
- Used by error handler middleware
- Define new error codes when adding features
- Map errors to HTTP status codes

## Import Patterns

### ✅ Correct Patterns

**In services (business logic):**
```typescript
import type { Recognition, GiveKudosParams } from '@/types/domain';
import type { DomainError } from '@/types/errors';

// Only domain types, no platform knowledge
```

**In Slack handlers:**
```typescript
import type { SlackUser, SlackMessage } from '@/types/slack';
import type { User } from '@/types/domain';

// Convert platform types to domain types
```

**In HTTP controllers:**
```typescript
import type { ApiResponse } from '@/types/api';
import type { Recognition } from '@/types/domain';

// Wrap domain types in API response
```

### ❌ Incorrect Patterns

**Don't mix domains in services:**
```typescript
// ❌ BAD - Service shouldn't know about Slack
import type { SlackUser } from '@/types/slack';

class UserService {
  createUser(user: SlackUser) { }
}
```

**Don't pass platform types to services:**
```typescript
// ❌ BAD - Handler should convert first
const handler = async ({ body }) => {
  await service.createUser(body); // body is Slack-specific
};

// ✅ GOOD - Convert to domain type first
const handler = async ({ body }) => {
  const user = convertToDomainUser(body);
  await service.createUser(user);
};
```

## Adding New Types

### When to Create Domain Types

Create new domain types when adding:
- New entities (e.g., `Announcement`, `Leaderboard`)
- New business workflows (e.g., `ReviewRequest`, `Approval`)
- Reusable request/response shapes

**File:** `/src/types/domain/[feature].ts`

```typescript
// Example: New feature type
export interface Announcement {
  id: string;
  teamId: string;
  content: string;
  publishedAt: Date;
}

export interface CreateAnnouncementParams {
  content: string;
}
```

### When to Create Platform Types

Create platform types only for:
- Platform-specific configuration
- Platform API responses that don't map to domain types
- UI-specific rendering hints

**File:** `/src/types/slack/[feature].ts`

Add to `slack/config.ts` or create new file and re-export in `slack/index.ts`.

### When to Create API Types

Create API types for:
- Query parameter validation (filters, pagination)
- Webhook payload shapes
- Batch operation requests

**File:** `/src/types/api/[feature].ts`

Add to appropriate file or create new one and re-export in `api/index.ts`.

## Type Reexports

The root `types/index.ts` re-exports public APIs from each domain:

```typescript
// types/index.ts
export type * from './api';
export type * from './domain';
export type * from './errors';
export type * from './slack';

// Consumers import from @/types directly
import type { Recognition, User } from '@/types';
```

**Never re-export internal/implementation types** that shouldn't be public.

## Multi-Platform Design

This type organization enables platform expansion:

1. **Services remain unchanged** - Only use domain types
2. **Platform handlers are isolated** - Slack handler directory, Google Chat handler directory, etc.
3. **Adapters convert types** - SlackUserAdapter converts SlackUser → User
4. **Code reuse is maximized** - Services work with any platform

**Adding Google Chat would:**
- Create `src/types/google-chat/` with platform types
- Create `src/features/*/handlers/google-chat/` handlers
- Reuse all existing services (no changes needed)
- Minimal code duplication (<5% vs 80% without refactoring)

## Circular Dependencies

Avoid circular type imports:

```typescript
// ❌ DON'T create cycles between domains
// domain/user.ts importing from domain/wallet.ts
// and wallet.ts importing from user.ts

// ✅ DO use shared types or abstract interfaces
// domain/shared.ts for types both need
```

## Verification Checklist

Before adding new types:
- [ ] Type is used by service or multiple features (not just one handler)
- [ ] Type has no platform imports (if in `/domain`)
- [ ] Type has no domain coupling (if in `/slack` or `/api`)
- [ ] Filename matches type name in snake-case
- [ ] Exported from appropriate `index.ts`
- [ ] Added to this documentation
- [ ] TypeScript builds without errors (`npm run build`)
