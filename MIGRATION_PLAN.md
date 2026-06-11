# Architecture Migration Plan

Refactoring from Slack-Bolt-structure (listeners grouped by event type) to Feature-First structure.

## Migration Order (with dependencies)

### Phase 1: Foundational (No dependencies)
These have no feature dependencies and will be used by other features.

#### PR #1: Installation Settings Feature
**Description**: Refactor app settings modal and installation config management

**Current files**:
- `src/listeners/actions/app-settings.ts` (inline modal)
- `src/listeners/views/save-settings.ts` (handler)
- `src/controllers/installation.ts` (business logic)

**New structure**:
```
src/features/installation/
├── handlers/
│   ├── app-settings-action.ts
│   ├── save-settings-view.ts
│   └── index.ts (register)
├── ui/
│   ├── settings-modal.ts (extract from app-settings.ts)
│   └── types.ts
├── services/
│   └── installation.service.ts (thin layer around controller)
└── types.ts
```

**Changes**:
- Extract inline modal from `app-settings.ts` → `ui/settings-modal.ts`
- Keep `RedeemController` in controllers (thin data access layer)
- Create `installation.service.ts` to orchestrate logic

---

#### PR #2: Wallet Feature
**Description**: Centralize wallet operations (balance checks, deposits, withdrawals)

**Current files**:
- `src/controllers/wallet.ts` (all wallet operations)
- `src/utils/write-csv.ts` (used by wallet reports)

**New structure**:
```
src/features/wallet/
├── services/
│   └── wallet.service.ts (orchestrates controller, utilities)
├── utils/
│   └── write-csv.ts (moved from src/utils)
└── types.ts
```

**Note**: This is light - mostly organizational. Wallet is primarily a utility feature used by others.

---

### Phase 2: Core Features (Use Phase 1)
These depend on Phase 1 foundations.

#### PR #3: Kudos Giving Feature ⭐
**Description**: Complete refactor of the "Give Kudos" workflow

**Current files**:
- `src/listeners/commands/give-kudos.ts` (command handler)
- `src/listeners/views/give-kudos.ts` (view submission)
- `src/views/give-kudos.ts` (modal builder + getGif logic)
- `src/controllers/recognition.ts` (business logic)

**New structure**:
```
src/features/kudos/
├── handlers/
│   ├── give-kudos-command.ts (opens modal)
│   ├── give-kudos-view.ts (handles submission)
│   ├── get-gif-action.ts (refresh gif button)
│   └── index.ts (register all)
├── ui/
│   ├── give-kudos-modal.ts (build modal blocks)
│   ├── gif-builder.ts (gif selection logic)
│   └── types.ts
├── services/
│   └── give-kudos.service.ts
│       - validateMonthlyLimit()
│       - createRecognition()
│       - sendKudosMessage()
│       - Orchestrates: recognitionController, installationService, walletService
├── clients/
│   ├── giphy.client.ts (moved from src/clients)
│   └── types.ts
└── types.ts
```

**Key changes**:
- Split modal builder from submission logic
- Create `give-kudos.service.ts` to orchestrate all steps
- Move Giphy client into feature (or keep shared if used elsewhere)
- Consolidate GIF handling into one place

---

#### PR #4: Card Redemption Feature
**Description**: Complete refactor of gift card redemption workflow

**Current files**:
- `src/listeners/actions/product-pages.ts` (show product list + pagination)
- `src/listeners/actions/choose-card.ts` (show amount modal)
- `src/listeners/views/generate-card.ts` (finalize redemption)
- `src/controllers/redeem.ts` (emit gift card)
- `src/controllers/product.ts` (product catalog)

**New structure**:
```
src/features/card-redemption/
├── handlers/
│   ├── redeem-button-action.ts (product-pages)
│   ├── pagination-action.ts (product-pages pagination)
│   ├── choose-card-action.ts
│   ├── generate-card-view.ts
│   └── index.ts (register)
├── ui/
│   ├── product-list-modal.ts (paginated catalog)
│   ├── amount-input-modal.ts (amount selection)
│   └── types.ts
├── services/
│   └── redeem-gift-card.service.ts
│       - validateBalance()
│       - emitGiftCard()
│       - updateWallet()
│       - Orchestrates: redeemController, walletService, productController
├── clients/
│   ├── todo-cartoes.client.ts (moved from src/clients)
│   └── types.ts
└── types.ts
```

**Key changes**:
- Extract inline modals from action handlers to `ui/`
- Create service to orchestrate the multi-step flow
- Move TodoCartoes client into feature

---

### Phase 3: Secondary Features (Use Phase 1 + 2)
These depend on the core features.

#### PR #5: Cancel Kudos Feature
**Description**: Refactor kudos cancellation

**Current files**:
- `src/listeners/commands/cancel-kudos.ts`
- `src/listeners/views/cancel-kudos.ts`
- Cancel logic in `controllers/recognition.ts`

**New structure**:
```
src/features/cancel-kudos/
├── handlers/
│   ├── cancel-kudos-command.ts
│   ├── cancel-kudos-view.ts
│   └── index.ts
├── ui/
│   ├── cancel-kudos-modal.ts
│   └── types.ts
├── services/
│   └── cancel-kudos.service.ts
└── types.ts
```

---

#### PR #6: Home Page Feature
**Description**: Refactor app home display (balance, recognitions, admin panel)

**Current files**:
- `src/listeners/events/app-home-opened.ts`
- `src/listeners/events/home/components/user-balance.ts`
- `src/listeners/events/home/components/recognition-list.ts`
- `src/listeners/events/home/components/admin-panel.ts`

**New structure**:
```
src/features/home-page/
├── handlers/
│   ├── app-home-opened.ts
│   └── index.ts
├── ui/
│   ├── home-blocks.ts (main renderer)
│   ├── components/
│   │   ├── user-balance.ts (displays balance + redeem button)
│   │   ├── recognition-list.ts (received kudos)
│   │   └── admin-panel.ts (stats + report buttons for auditors)
│   └── types.ts
├── services/
│   └── home-page.service.ts
│       - Orchestrates: recognitionService, walletService, installationService
└── types.ts
```

---

### Phase 4: Reporting Features (Use all above)

#### PR #7: Wallet Report Feature
**Description**: Generate and export wallet transaction reports

**Current files**:
- `src/listeners/actions/wallet-report.ts`
- `src/listeners/views/generate-wallet-report.ts`
- Transaction logic in `controllers/transaction.ts`

**New structure**:
```
src/features/wallet-report/
├── handlers/
│   ├── open-wallet-report.ts
│   ├── generate-wallet-report-view.ts
│   └── index.ts
├── ui/
│   ├── wallet-report-modal.ts
│   └── types.ts
├── services/
│   └── wallet-report.service.ts
└── types.ts
```

---

#### PR #8: Prizes Report Feature
**Description**: Generate and export prizes/redemption reports

**Current files**:
- `src/listeners/actions/prizes-report-modal.ts`
- `src/listeners/views/generate-prizes-report.ts`
- Report logic in `controllers/product.ts`

**New structure**:
```
src/features/prizes-report/
├── handlers/
│   ├── open-prizes-report.ts
│   ├── generate-prizes-report-view.ts
│   └── index.ts
├── ui/
│   ├── prizes-report-modal.ts
│   └── types.ts
├── services/
│   └── prizes-report.service.ts
└── types.ts
```

---

## What Stays in `src/` Root

These don't become features - they're truly shared infrastructure:

```
src/
├── controllers/           (thin data access layer)
│   ├── installation.ts
│   ├── user.ts
│   ├── recognition.ts
│   ├── wallet.ts
│   ├── transaction.ts
│   ├── product.ts
│   ├── redeem.ts
│   └── index.ts
├── entities/             (database models - TypeORM)
├── shared/
│   ├── utils/            (truly shared: crypto, logger, cache, etc)
│   ├── models/           (shared data models)
│   └── types/
├── migrations/           (TypeORM migrations)
├── app.ts
└── data-source.ts
```

## Testing Strategy

For each PR:
1. Keep tests colocated with features (in feature folders)
2. Move sample data into feature's test folder
3. Run full test suite to ensure no regressions

Example (PR #3 - Kudos Giving):
```
src/features/kudos/
├── handlers/
├── ui/
├── services/
├── __tests__/
│   ├── give-kudos.service.test.ts
│   ├── handlers/
│   │   ├── give-kudos-command.test.ts
│   │   └── give-kudos-view.test.ts
│   ├── ui/
│   │   └── give-kudos-modal.test.ts
│   └── fixtures/
│       └── samples.ts
└── types.ts
```

## Summary

**Total PRs**: 8  
**Approx timeline**: 1 PR per day to 1 week (depending on testing)  
**Risk**: Low - each feature is isolated; old code removed only after PR merges  
**Benefits**:
- Clear feature boundaries
- Easier to test in isolation
- Future developers know where to find code
- Easier to add/modify features without side effects

---

## Next Steps

1. ✅ Create this migration plan
2. ⬜ Start PR #1: Installation Settings Feature
3. ⬜ Review and merge PR #1
4. ⬜ Continue with PR #2, #3, etc.

Each PR should:
- Include only one feature
- Have passing tests
- Include a description of the new structure
- Be reviewable in <500 lines of changes ideally (some PRs will be bigger)
