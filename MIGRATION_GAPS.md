# Migration Gaps & Missing Steps

## Current Status
✅ Phases 1-13 Complete
- Phase 11: Multi-platform adapter layer
- Phase 12: Handler organization into /slack/ subdirectories  
- Phase 13: Google Chat adapter + multi-platform expansion guide

**Tests:** 191/191 passing
**TypeScript:** Compiles successfully

---

## Architecture Gaps

### 1. **Missing Adapter Interface Methods** ⚠️
Not yet used in codebase, but defined in interfaces:

**UserInfoProvider (not implemented in handlers):**
- `getUserInfo()` - Fetch user details by ID
- `getConversationInfo()` - Fetch channel/space info
- `getUserList()` - List all users in workspace

**FileUploader (not implemented):**
- `uploadFile()` - Upload files to platform
- `deleteFile()` - Delete uploaded files

**ModalManager (partially implemented):**
- `pushModal()` - Stack modals (defined but unused)
- `closeModal()` - Close modals (defined but unused)

**MessagePublisher (partially implemented):**
- `updateMessage()` - Edit existing messages (defined but unused)

### 2. **Incomplete Handler Refactoring** 
Some handlers still have workarounds:

**cancel-kudos-command.ts (line 41)**
```typescript
// TODO: Implement postEphemeral in adapter
```
- Need to add `postEphemeral()` to MessagePublisher interface
- Used for posting messages only to command invoker

**home-page handler (line 20)**
```typescript
// TODO: Extend adapter interface to support home tab publishing
```
- Slack-specific feature: `views.publish()` for home tabs
- Currently falls back to raw client call
- Need platform-specific interface extension or capability detection

**wallet-report service (line 21)**
```typescript
// TODO: Update service to accept adapter instead of client
```
- Service signature: `generateReport(params, client: any)`
- Client is passed as `undefined` - should be removed or replaced with adapter

### 3. **UI Builders Not Organized by Platform**
Current structure:
```
src/features/*/ui/
├── slack/         (all features)
└── google-chat/   (only kudos)
```

**Missing:** Google Chat UI for:
- cancel-kudos
- card-redemption
- home-page
- installation
- prizes-report
- wallet-report

### 4. **Listeners Not Organized by Platform**
Current structure:
```
src/listeners/
├── slack/                (Slack listeners)
├── actions/
├── commands/
├── events/
└── views/
```

**Gap:** No platform-agnostic listener pattern. All listeners are Slack-specific.

**What's needed:**
```
src/listeners/
├── slack/
│   ├── commands/
│   ├── actions/
│   ├── events/
│   └── views/
└── (future: google-chat/, discord/, teams/)
```

### 5. **Service Layer Coupling**
Some services still accept platform-specific clients:

**Files to refactor:**
- `src/features/wallet-report/services/wallet-report.service.ts` - accepts `client: any`
- `src/features/card-redemption/services/redeem-gift-card.service.ts` - may have similar issue

**Pattern to implement:**
```typescript
// Before
async generateReport(params, client: any)

// After
async generateReport(params)
// Use RequestContext to access adapter if needed
```

### 6. **Home Tab Publishing (Slack-Specific)**
**File:** `src/features/home-page/handlers/slack/app-home-opened.ts` (line 19-22)

```typescript
// Use raw client for home tab publishing (Slack-specific feature)
// TODO: Extend adapter interface to support home tab publishing
await client.views.publish({...})
```

**Options to address:**
1. Add `publishHomeTab()` to PlatformAdapter interface
2. Create platform capability detection (`adapter.supports('home_tab')`)
3. Create HomeTabPublisher sub-interface

### 7. **Missing Adapter Methods (Not in Interface)**
Found in handlers but not in PlatformAdapter:

**postEphemeral** (Slack: send message only to user who triggered action)
- Location: `src/features/cancel-kudos/handlers/slack/cancel-kudos-command.ts`
- Needed by: Multiple handlers for private responses

**updateMessage** and **deleteMessage**
- Defined but not used
- Should validate these are properly implemented in SlackAdapter

### 8. **Missing Tests**
**Gap:** No tests for:
- ✅ Adapter implementations (SlackAdapter exists but needs comprehensive tests)
- ❌ GoogleChatAdapter (only implementation, no tests)
- ❌ Handler refactoring to use adapters (some old tests may still mock client)
- ❌ Multi-platform scenarios
- ❌ Adapter interface compliance

### 9. **Documentation Gaps**
**Incomplete:**
- No deployment guide for multi-platform setup
- No credential/configuration management documented
- No troubleshooting guide for platform-specific issues
- No migration guide for adding existing features to new platforms

---

## Missing Implementation Steps

### Phase 14: Complete Handler Refactoring
- [ ] Remove `client` parameter from service methods
- [ ] Update service signatures to use RequestContext
- [ ] Add missing adapter interface methods:
  - `postEphemeral()`
  - `updateMessage()`
  - `publishHomeTab()` or capability detection

### Phase 15: Listener Organization by Platform
- [ ] Reorganize listeners into platform subdirectories
- [ ] Create listener pattern documentation
- [ ] Implement listener registration for multiple platforms

### Phase 16: Complete Adapter Coverage
- [ ] Implement remaining adapter methods in SlackAdapter
- [ ] Write comprehensive tests for all adapters
- [ ] Test all handler scenarios with adapter

### Phase 17: Add Missing Feature Support
- [ ] Add Google Chat UI builders for all features
- [ ] Implement ephemeral messaging for cancel-kudos
- [ ] Handle platform-specific features (home tabs, etc.)

### Phase 18: Testing & Validation
- [ ] Unit tests for all adapter methods
- [ ] Integration tests for handler + adapter combinations
- [ ] Platform-specific behavior tests

### Phase 19: Documentation
- [ ] Deployment & setup guide
- [ ] Credential management guide
- [ ] Platform capability matrix
- [ ] Migration checklist for new platforms

---

## Code Smells & Technical Debt

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Service accepts unused `client` param | Medium | wallet-report, redeem | TODO |
| Home tab publishing falls back to raw client | Medium | home-page handler | TODO |
| postEphemeral not in adapter interface | High | cancel-kudos handler | TODO |
| Services still tied to Slack in places | Medium | Various services | TODO |
| No platform capability detection | Low | Adapter pattern | TODO |
| Tests still use client mocks | Medium | Feature tests | TODO |

---

## Priority Implementation Order

**High Priority (Blocks multi-platform):**
1. Remove `client` parameters from services
2. Add `postEphemeral()` to adapter interface
3. Handle home tab publishing pattern
4. Complete listener reorganization

**Medium Priority (Quality):**
5. Write comprehensive adapter tests
6. Complete Google Chat UI builders for all features
7. Implement remaining adapter methods in SlackAdapter

**Low Priority (Documentation):**
8. Create deployment guides
9. Document platform capabilities
10. Create troubleshooting guides

---

## Quick Health Check

```bash
# Current state
✅ Services: Platform-agnostic (no @slack imports)
✅ Handlers: Using adapters (15/15 features)
✅ Adapters: Slack implemented, Google Chat example
✅ Tests: All passing (191/191)
⚠️  Listeners: Still Slack-only organization
⚠️  UI Builders: Incomplete platform coverage
⚠️  Adapter: Missing methods & tests
```

---

## Estimated Effort

| Phase | Task | Effort |
|-------|------|--------|
| 14 | Complete handler refactoring | 2-3 days |
| 15 | Listener organization | 2-3 days |
| 16 | Adapter completeness | 3-4 days |
| 17 | Feature coverage | 2-3 days |
| 18 | Testing | 3-4 days |
| 19 | Documentation | 2-3 days |
| **Total** | **Full multi-platform ready** | **15-20 days** |

**Current state to production-ready:** ~2 weeks
