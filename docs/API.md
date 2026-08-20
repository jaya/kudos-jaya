# API Documentation

## Overview

Kudos Jaya exposes HTTP endpoints for workspace installation, configuration, and user management. The app primarily communicates with Slack via events and commands, but provides these REST endpoints for administrative functions.

## Authentication

### OAuth 2.0 Flow

The app uses Slack OAuth 2.0 for installation:

1. User visits `/slack/install/workspace`
2. Redirected to Slack's authorization page
3. User grants permissions
4. Slack redirects to `/slack/oauth_redirect` with authorization code
5. App exchanges code for access token
6. Token stored in database with workspace config

**Required Scopes:**
- `commands` - Handle slash commands
- `chat:write` - Post messages
- `chat:write.public` - Post in public channels
- `views.open` - Open modals
- `views.update` - Update modals
- `users:read` - Get user information
- `team:read` - Get workspace info
- `app_mentions:read` - Handle app mentions

### Bot Token

The app uses `SLACK_BOT_TOKEN` for direct API calls. Token is:
- Obtained during OAuth flow
- Stored encrypted in database
- Retrieved per workspace (`teamId`)
- Injected into RequestContext for handlers

## HTTP Endpoints

### Installation & OAuth

#### `GET /slack/install/workspace`

Start Slack OAuth installation flow.

**Response:** Redirects to Slack authorization page

**Example:**
```bash
curl https://yourapp.com/slack/install/workspace
```

---

#### `GET /slack/oauth_redirect`

OAuth callback endpoint.

**Query Parameters:**
- `code` - Authorization code from Slack
- `state` - CSRF token for security
- `error` - Error code if user denied permissions

**Response:** Redirects to success/error page

---

### User Management

#### `GET /api/users/:slackUserId`

Get user details by Slack user ID.

**Response:**
```json
{
  "id": "U123456",
  "email": "user@example.com",
  "name": "John Doe",
  "active": true
}
```

**Status Codes:**
- `200` - User found
- `404` - User not found
- `500` - Server error

**Example:**
```bash
curl https://yourapp.com/api/users/U123456
```

---

### Slack Events

Slack sends events to `/slack/events` endpoint (configured in manifest.json).

#### Event Types Handled

**app_home_opened**
```json
{
  "type": "event_callback",
  "event": {
    "type": "app_home_opened",
    "user": "U123456",
    "channel": "D123456"
  }
}
```

Response: Publish home tab with wallet info

---

**app_mention**
```json
{
  "type": "event_callback",
  "event": {
    "type": "app_mention",
    "user": "U123456",
    "text": "<@U999> help",
    "channel": "C123456"
  }
}
```

Response: Post help message

---

### Slack Commands

Commands are registered in `manifest.json` and sent to `/slack/events`.

#### `/give-kudos`

Open modal to give kudos to team members.

**Response:** Modal with user selection, message input, and GIF

---

#### `/cancel-kudos`

Open modal to cancel previously sent kudos.

**Response:** Modal with list of sent kudos to cancel

---

### Slack Actions (Interactive Components)

Actions are sent to `/slack/events` (configured in manifest.json).

#### Button Actions

**Button: Open Wallet Report**
```json
{
  "type": "block_actions",
  "actions": [{
    "type": "button",
    "action_id": "open_wallet_report",
    "block_id": "wallet_block"
  }]
}
```

Response: Send CSV file or error message

---

#### Modal Submissions

**Submit: Give Kudos Modal**
```json
{
  "type": "view_submission",
  "view": {
    "id": "V123456",
    "callback_id": "give_kudos_view",
    "state": {
      "values": {
        "user_select": { "selected_users": [...] },
        "message_input": { "message": "text" }
      }
    }
  }
}
```

Response: Validate and create recognitions in database

---

## Error Responses

All error responses follow this format:

```json
{
  "ok": false,
  "error": "invalid_users",
  "error_description": "One or more selected users are inactive"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `invalid_users` | Selected users don't exist or are inactive |
| `monthly_limit_reached` | User has given all monthly kudos |
| `invalid_channel` | Kudos channel not configured |
| `product_not_found` | Gift card product not available |
| `api_error` | External API (Giphy, Todo Cartões) error |
| `db_error` | Database error |
| `unauthorized` | Missing or invalid Slack token |

---

## Rate Limiting

**Slack API Rate Limits:**
- 1 request per second per method
- 60 requests per minute overall

**App Internal Limits:**
- 5 requests per second per user
- 100 requests per minute per workspace

Hitting limits returns `429 Too Many Requests`.

---

## Webhooks

### Installation Webhooks

When workspace is installed/configured, the app sends:

```
POST https://jaya-notifications.internal/workspace_installed

{
  "teamId": "T123456",
  "teamName": "My Company",
  "installedAt": "2026-08-20T14:30:00Z",
  "adminEmail": "admin@example.com"
}
```

---

## Signature Verification

All Slack requests include signatures for security verification.

**Headers:**
- `X-Slack-Request-Timestamp` - Unix timestamp
- `X-Slack-Signature` - HMAC-SHA256 signature

**Verification:**
```typescript
import crypto from 'crypto';

const timestamp = headers['x-slack-request-timestamp'];
const signature = headers['x-slack-signature'];
const body = rawBody; // Raw request body as string

const hmac = crypto
  .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  .update(`v0:${timestamp}:${body}`)
  .digest('hex');

const valid = `v0=${hmac}` === signature;
```

---

## Environment Variables Required

```bash
# Slack App
SLACK_CLIENT_ID=xoxb-...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
SLACK_STATE_SECRET=...  # Random string for OAuth security

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=kudos_jaya

# Encryption
ENCRYPTION_KEY=...  # 32-character string for token encryption

# External APIs
GIPHY_API_KEY=...
TODO_API_BASE_URL=https://api.todocartoes.com
TODO_API_KEY=...
```

---

## Example Workflows

### Complete Kudos Workflow

1. User runs `/give-kudos` command
2. App opens modal with:
   - User multi-select
   - Message input
   - GIF preview
   - Company values checkboxes
3. User selects recipients, enters message, clicks Share
4. App validates:
   - Users are active
   - Sender hasn't exceeded monthly limit
   - Recipients haven't exceeded daily limit
5. App posts message to workspace channel
6. Creates Recognition records in database
7. Sends DMs to recipients with gift notification

### Installation Workflow

1. User visits `/slack/install/workspace`
2. Redirected to Slack OAuth
3. User grants permissions
4. Slack redirects to `/slack/oauth_redirect`
5. App stores token + workspace config
6. App sends DM to user with setup modal
7. User configures:
   - Kudos channel
   - API tokens for gift cards
   - Monthly kudos limit
8. User completes setup
9. App is ready to use

---

## Debugging

### Enable Debug Logging

```bash
DEBUG=* npm start
```

### Check Slack Event Logs

```bash
# View recent requests to app
pm2 logs kudos-jaya --out --raw | grep "event_type"
```

### Verify Signatures

```bash
# Check if signature verification is passing
pm2 logs kudos-jaya --out --raw | grep "signature"
```

---

## Migration from REST to GraphQL

Currently planned for future version. GraphQL endpoint will be at `/graphql` with schema documenting:
- Workspace config queries
- Recognition mutations
- User/wallet subscriptions

This will maintain backward compatibility with existing REST endpoints.
