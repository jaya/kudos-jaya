# Platform Capabilities Matrix

This document shows which features are available on each supported platform.

## Feature Support by Platform

| Feature | Slack | Google Chat | Discord | Status |
|---------|:-----:|:-----------:|:-------:|--------|
| **Give Kudos** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |
| **Cancel Kudos** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |
| **Redeem Card** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |
| **Wallet Report** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |
| **Prizes Report** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |
| **Home Tab** | ✅ | ❌ | ❌ | Slack-specific, planned for GChat |
| **Ephemeral Messages** | ✅ | ❌ | ❌ | Slack-specific |
| **Installation** | ✅ | 🚧 | ❌ | Slack: Production, GChat: Phase 16 |

**Legend:**
- ✅ = Fully implemented and tested
- 🚧 = In progress (Phase 16)
- ❌ = Not planned or in scope
- Blank = Not applicable

---

## Feature Details by Platform

### Slack ✅

**Fully Implemented**

All 8 features are production-ready:
- Give Kudos with modal and GIF preview
- Cancel previously sent kudos
- Redeem gift cards with card selection
- Wallet report with CSV export
- Prizes report with analytics
- Home tab with wallet balance
- Installation with workspace config
- Settings management in home tab

**Platform-Specific Features:**
- **Ephemeral Messages**: Send message only to command invoker
- **Home Tab**: Publish persistent workspace-specific view
- **Modal Stacking**: Push modals on top of each other
- **Reactions**: Add emoji reactions to messages
- **Threads**: Organize messages in threads

**Requirements:**
- Slack workspace
- Slack app installed with required scopes
- OAuth token stored with workspace

---

### Google Chat 🚧

**In Progress (Phase 16)**

Being implemented in Phase 16:
- Give Kudos with space cards
- Cancel kudos with message reply
- Redeem gift cards in space
- Wallet report in space
- Prizes report in space
- Installation setup in DM
- Settings in DM with interactive cards

**Platform-Specific Features:**
- **Cards**: Rich formatted messages using Google Chat cards
- **Spaces**: Work in spaces (group chats) and direct messages
- **Threads**: Reply in threads for organization
- **Webhooks**: Receive events via webhooks instead of Socket Mode

**Requirements:**
- Google Chat API credentials
- Google Chat space or direct message
- Service account for authentication

**Limitations:**
- No home tab equivalent
- No ephemeral messages
- No modal stacking
- Cards have different formatting than Slack blocks

---

### Discord ❌

**Not Currently Planned**

Discord support is NOT planned for Phase 17-19. Future considerations:

**Potential Features:**
- Give Kudos with slash commands and embeds
- Cancel kudos with message interactions
- Redeem cards with button interactions
- Wallet report with text export
- Prizes report with embed cards

**Limitations to Consider:**
- Different permission model
- No home tab equivalent
- Different rate limiting
- No OAuth flow (bot token only)

**Future Planning:**
If Discord support is desired, estimated effort: 5-7 days for initial adapter and feature implementation.

---

## Platform Adapter Matrix

| Adapter Method | Slack | Google Chat | Status |
|---|:---:|:---:|---|
| `postMessage()` | ✅ | ✅ | Both platforms |
| `updateMessage()` | ✅ | ✅ | Edit existing messages |
| `deleteMessage()` | ✅ | ✅ | Remove messages |
| `postEphemeral()` | ✅ | ❌ | Slack-specific |
| `openModal()` | ✅ | ✅ | Show modal/card |
| `updateModal()` | ✅ | ✅ | Edit modal/card |
| `pushModal()` | ✅ | ❌ | Slack modal stacking |
| `closeModal()` | ✅ | ✅ | Dismiss modal/card |
| `publishHomeTab()` | ✅ | ❌ | Slack-specific |
| `getUserInfo()` | ✅ | ✅ | Fetch user details |
| `getConversationInfo()` | ✅ | ✅ | Fetch channel/space details |
| `getUserList()` | ✅ | ✅ | List workspace users |
| `uploadFile()` | ✅ | ❌ | File upload support |
| `deleteFile()` | ✅ | ❌ | File deletion support |

---

## UI Builders

| Builder | Slack | Google Chat | Status |
|---------|:-----:|:-----------:|--------|
| Give Kudos Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Cancel Kudos Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Card Selection Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Settings Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Wallet Report Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Prizes Report Modal | ✅ | 🚧 | Slack: Production, GChat: Phase 16 |
| Home Tab | ✅ | ❌ | Slack-specific |

---

## Deployment Scope

### Production (Now)

**Slack workspace:** All 8 features ready for production use.

**Rollout Plan:**
1. ✅ Adapter layer complete (Phase 11)
2. ✅ All handlers tested (Phase 15)
3. ⏳ Comprehensive testing (Phase 17)
4. ⏳ Documentation complete (Phase 18)
5. ⏳ Production readiness validated (Phase 19)
6. → Deploy to production after Phase 19

### Staging (Phase 16+)

**Google Chat space:** Features rolling in Phase 16.

### Future

**Discord, Teams, etc.:** Can be added following same adapter pattern.

---

## Migration Path

To add a new platform:

1. **Implement Adapter** (`src/adapters/<platform>/<platform>-adapter.ts`)
   - Implement PlatformAdapter interface
   - Map platform SDK to adapter methods
   - Handle platform-specific quirks

2. **Add Handlers** (`src/features/*/handlers/<platform>/*`)
   - Handlers are 80% reusable from Slack
   - Platform SDK usage isolated to adapter

3. **Add UI Builders** (`src/features/*/ui/<platform>/*`)
   - Create platform-specific UI components
   - Convert domain models to platform format

4. **Test** (`src/**/__tests__/*`)
   - Unit tests for adapter
   - Integration tests for handlers with adapter
   - Contract tests verifying adapter meets interface

5. **Document** (`docs/PLATFORM_CAPABILITIES.md`)
   - Update this matrix
   - Add platform-specific limitations
   - Document SDK/API requirements

**Estimated Effort:** 5-7 days per platform after Phase 19.

---

## Roadmap

### Q4 2026

- ✅ Phase 17: Complete test coverage (Aug 22-25)
- ✅ Phase 18: Documentation (Aug 25-28)
- ✅ Phase 19: Production validation (Aug 28-29)
- → Deploy to production Slack workspace

### Q1 2027

- 🚧 Phase 16: Google Chat UI builders (Jan 5-10)
- → Launch Google Chat support

### Q2 2027 (Tentative)

- ⏳ Discord or Teams adapter
- ⏳ Auto-scaling for multi-workspace deployments

---

## Questions About Platforms?

See:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Platform-specific setup
- [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md#adr-001-adapter-pattern-for-platform-abstraction) - Why adapters
- [API.md](API.md) - Slack API details
