# Multi-Platform Expansion Guide

This guide explains how to add support for a new platform (e.g., Discord, Google Chat, Microsoft Teams) to the Kudos Jaya application.

## Architecture Overview

The application uses a **Platform Adapter Pattern** to abstract platform-specific implementation details behind a common interface. This allows services and business logic to remain completely platform-agnostic.

```
User Interaction
       ↓
[Platform-Specific Handler] ← Translates platform events
       ↓
[PlatformAdapter Interface] ← Common abstraction
       ↓
[Services] ← Platform-agnostic business logic
       ↓
[Database] ← Shared across all platforms
```

## Key Components

### 1. Adapter Interfaces (`src/adapters/interfaces/`)

All platform adapters must implement these interfaces:

- **`PlatformAdapter`** - Master interface combining all sub-interfaces
  - `getPlatformName(): string` - Returns platform identifier ('slack', 'google-chat', etc.)

- **`MessagePublisher`** - For posting and managing messages
  - `postMessage()` - Send a message to a channel/user
  - `updateMessage()` - Edit an existing message
  - `deleteMessage()` - Remove a message

- **`ModalManager`** - For interactive dialogs/forms
  - `openModal()` - Show a modal/dialog
  - `updateModal()` - Update modal content
  - `pushModal()` - Stack multiple modals
  - `closeModal()` - Close a modal

- **`UserInfoProvider`** - For querying user/space information
  - `getUserInfo()` - Get user details
  - `getConversationInfo()` - Get channel/space details
  - `getUserList()` - List all users

- **`FileUploader`** - For file operations
  - `uploadFile()` - Upload a file
  - `deleteFile()` - Delete a file

### 2. Adapter Implementation

Each platform has its own adapter implementation. For example:

- **`src/adapters/slack/slack-adapter.ts`** - Slack implementation
- **`src/adapters/google-chat/google-chat-adapter.ts`** - Google Chat implementation

The adapter wraps platform-specific SDK calls and translates parameters to/from the common interface format.

## Adding a New Platform - Step-by-Step

### Step 1: Create Adapter Implementation

Create a new directory: `src/adapters/[platform-name]/`

Example: `src/adapters/discord/`

```typescript
// src/adapters/discord/discord-adapter.ts
import { PlatformAdapter } from '../interfaces';
import logger from '@/utils/logger';

export class DiscordAdapter implements PlatformAdapter {
  constructor(private readonly discordClient: any) {}

  async postMessage(params: {
    channel: string;
    text: string;
    blocks?: Record<string, unknown>[];
    thread_ts?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ts: string; channel: string }> {
    try {
      // Translate generic interface to Discord SDK calls
      const message = await this.discordClient.channels
        .cache.get(params.channel)
        .send({
          content: params.text,
          embeds: this.convertBlocksToEmbeds(params.blocks),
        });
      return {
        ts: message.id,
        channel: params.channel,
      };
    } catch (error) {
      logger.error('DiscordAdapter.postMessage()', error);
      throw error;
    }
  }

  // Implement other interface methods...
  // See SlackAdapter for reference implementation

  getPlatformName(): string {
    return 'discord';
  }

  private convertBlocksToEmbeds(blocks?: Record<string, unknown>[]) {
    // Convert from generic block format to Discord embed format
    // This is where platform-specific formatting happens
  }
}
```

Create `src/adapters/[platform-name]/index.ts`:

```typescript
export { DiscordAdapter } from './discord-adapter';
```

Update `src/adapters/index.ts`:

```typescript
export * from './interfaces';
export * from './slack';
export * from './google-chat';
export * from './discord'; // Add new platform
```

### Step 2: Create Platform-Specific Handlers

Handlers translate platform-specific events into adapter calls. They use the common `RequestContext` to access the platform adapter.

Directory structure:
```
src/features/[feature]/handlers/
├── slack/
│   ├── give-kudos-command.ts
│   └── index.ts
├── discord/           # NEW
│   ├── give-kudos-command.ts
│   └── index.ts
└── index.ts
```

Example handler:

```typescript
// src/features/kudos/handlers/discord/give-kudos-command.ts
import { GiveKudosService } from '../../services/give-kudos.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const giveKudosCommandHandler = withRequestContext(async (interaction) => {
  try {
    const context = RequestContext.get();
    const adapter = context.adapter;

    // Business logic is platform-agnostic
    const service = new GiveKudosService();
    const validation = await service.validateMonthlyLimit(interaction.user.id);

    // Platform operations go through adapter
    if (!validation.canGive) {
      await adapter.postMessage({
        channel: interaction.user.id,
        text: validation.message,
      });
    }
  } catch (error) {
    logger.error('giveKudosCommandHandler(discord)', error);
  }
});

export default giveKudosCommandHandler;
```

Key rules for handlers:
- Extract platform-specific data at the handler boundary
- Use `RequestContext.get()` to access the adapter
- Call services with platform-agnostic parameters
- Use adapter interface methods for all platform operations

### Step 3: Create Platform-Specific UI Builders

UI builders format data for platform-specific display formats.

Slack uses Block Kit, Discord uses Embeds, Google Chat uses Cards, etc.

```typescript
// src/features/kudos/ui/discord/give-kudos-modal.ts
export function getKudosView(
  gif: string,
  companyValues: CompanyValueOption[],
  maxSelectedItems?: number,
): Record<string, unknown> {
  // Build Discord embed format
  return {
    embeds: [
      {
        title: 'Give someone kudos',
        image: { url: gif },
        fields: [
          {
            name: 'Recipients',
            value: 'Select from the dropdown above',
          },
        ],
      },
    ],
  };
}
```

### Step 4: Register Platform in Event Listeners

Update listener registration to instantiate adapters for incoming events:

```typescript
// src/listeners/discord/index.ts
import { DiscordAdapter } from '@/adapters';
import { RequestContext } from '@/context';

bot.on('interactionCreate', async (interaction) => {
  // Initialize adapter for this request
  const adapter = new DiscordAdapter(interaction.client);
  
  // Set context with adapter
  const context = {
    teamId: 'workspace-id', // Discord equivalent
    adapter,
  };
  
  await RequestContext.run(context, async () => {
    // Handle interaction with access to adapter via RequestContext
    await handleDiscordInteraction(interaction);
  });
});
```

### Step 5: Create Listeners for Platform Events

Listeners bridge between platform SDK and handlers:

```typescript
// src/listeners/discord/give-kudos-listener.ts
import giveKudosCommandHandler from '@/features/kudos/handlers/discord/give-kudos-command';

export function registerGiveKudosListener(bot: any) {
  bot.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === 'give-kudos') {
      // Adapt Discord interaction to handler interface
      await giveKudosCommandHandler({
        userId: interaction.user.id,
        spaceId: interaction.guildId,
        triggerId: interaction.id,
      });
    }
  });
}
```

## Implementation Checklist

- [ ] Create adapter implementation (`src/adapters/[platform]/adapter.ts`)
- [ ] Implement all `PlatformAdapter` interface methods
- [ ] Create format converters for UI (Block Kit → Platform Format)
- [ ] Create handlers for each feature (`src/features/*/handlers/[platform]/`)
- [ ] Create UI builders for each feature (`src/features/*/ui/[platform]/`)
- [ ] Create listeners for platform events (`src/listeners/[platform]/`)
- [ ] Register listeners in main application setup
- [ ] Write tests for adapter implementation
- [ ] Write tests for platform-specific handlers
- [ ] Test with real platform
- [ ] Update documentation

## Example: Full Feature Implementation

Here's what implementing "Give Kudos" for a new platform looks like:

1. **Adapter** handles:
   - `openModal()` - Discord slash command shows form
   - `postMessage()` - Message confirmation

2. **Handler** uses:
   - `service.validateMonthlyLimit()` - Platform-agnostic
   - `adapter.openModal()` - Platform-agnostic interface
   - `adapter.postMessage()` - Platform-agnostic interface

3. **UI Builder** returns:
   - Discord embed format (not Block Kit)

4. **Listener** does:
   - Listens for Discord slash commands
   - Routes to handler

5. **Database** stores:
   - Same data for all platforms
   - Recognitions, wallets, etc.

## Time Estimates

Based on the architecture above:

- **Adapter + 1 Feature (Give Kudos)**: 4-6 hours
- **All Features**: 2-3 days
- **Testing + Refinement**: 1-2 days
- **Total per platform**: 3-5 days

## Testing

### Unit Tests for Adapter

```typescript
describe('DiscordAdapter', () => {
  let adapter: DiscordAdapter;
  let mockClient: jest.Mocked<any>;

  beforeEach(() => {
    mockClient = {
      channels: { cache: { get: jest.fn() } },
    };
    adapter = new DiscordAdapter(mockClient);
  });

  it('should post a message', async () => {
    const result = await adapter.postMessage({
      channel: 'channel-id',
      text: 'Hello',
    });
    expect(result).toHaveProperty('ts');
  });
});
```

### Integration Tests for Handlers

Handlers can be tested with mocked adapters since they use RequestContext:

```typescript
describe('Give Kudos Handler (Discord)', () => {
  it('should use adapter for posting messages', async () => {
    const mockAdapter = {
      postMessage: jest.fn(),
      openModal: jest.fn(),
    };
    
    RequestContext.set({ adapter: mockAdapter, teamId: 'test' });
    
    await giveKudosCommandHandler(discordEvent);
    
    expect(mockAdapter.openModal).toHaveBeenCalled();
  });
});
```

## Support for Multiple Workspaces

When deploying to a new platform with multiple teams/workspaces:

1. **Database Schema** - Add workspace identifier
2. **Installation Table** - Store platform credentials per workspace
3. **Context Setup** - Extract workspace ID from platform event
4. **Adapter Instantiation** - Use workspace-specific credentials

Example:

```typescript
// In listener
const workspace = await getWorkspace(interaction.guildId);
const adapter = new DiscordAdapter(workspace.botToken);
const context = {
  teamId: workspace.id,
  adapter,
};
```

## Troubleshooting

### Adapter method not called
- Check `RequestContext.get()` is being called
- Verify adapter is set in context during handler execution
- Check for exceptions in service layer

### UI not displaying correctly
- Verify block conversion function handles all block types
- Check platform API documentation for format requirements
- Test with platform's CLI/interactive examples

### Messages not being sent
- Check platform credentials/permissions
- Verify channel IDs are in correct format
- Check adapter error logging for API errors

## References

- Slack Adapter: `src/adapters/slack/slack-adapter.ts`
- Google Chat Adapter: `src/adapters/google-chat/google-chat-adapter.ts`
- Service Example: `src/features/kudos/services/give-kudos.service.ts`
- Handler Example: `src/features/kudos/handlers/slack/give-kudos-command.ts`

## Questions?

Refer to:
- Architecture docs in this file
- Existing adapter implementations
- Test files for usage examples
- Phase 11 & 12 commits for refactoring context
