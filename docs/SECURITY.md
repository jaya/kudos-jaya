# Security Guidelines

This document outlines security practices for Kudos Jaya development and deployment.

## Secret Management

### Environment Variables

**Never commit secrets to version control.**

Secrets in `.env`:
- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET`
- `ENCRYPTION_KEY`
- `DB_PASSWORD`
- `GIPHY_API_KEY`
- `TODO_API_KEY`

**Storage:**
- `.env` in `.gitignore` (never commit)
- Use `.env.example` for documentation without secrets
- Store in password manager for reference
- Use CI/CD secrets for deployment environments

### Rotating Secrets

**Database Password:**
1. Update in database service
2. Update `.env` in deployment
3. Restart app
4. Monitor for connection errors

**Slack Secrets:**
1. Generate new credentials at Slack API app
2. Update `.env` and deployment
3. Old credentials still valid during transition
4. Remove old credentials after verification

**ENCRYPTION_KEY:**
⚠️ **Critical:** Cannot change without losing encrypted data
- Plan carefully before changing
- Must re-encrypt all stored tokens
- Requires database migration

---

## Token Management

### Token Encryption

Slack bot tokens are encrypted before storage:

```typescript
import crypto from 'crypto';

// Encrypt when storing
const encrypted = crypto
  .createCipher('aes-256-cbc', ENCRYPTION_KEY)
  .update(token)
  .final('hex');

// Decrypt when using
const decrypted = crypto
  .createDecipher('aes-256-cbc', ENCRYPTION_KEY)
  .update(encrypted, 'hex')
  .final('utf-8');
```

### Token Rotation

Slack tokens don't expire. However, rotate when:
1. App credentials compromised
2. Staff member leaves
3. Regular security audit (yearly)

**Procedure:**
1. Generate new Slack app credentials
2. Update `SLACK_CLIENT_SECRET` in deployment
3. Reinstall app to all workspaces
4. Old tokens automatically replaced on OAuth flow

### Token Security

**Do NOT:**
- Log tokens to stdout/logs
- Pass tokens in query strings
- Commit tokens to version control
- Share tokens via chat/email

**Do:**
- Store encrypted in database
- Retrieve only when needed
- Use for Slack API calls only
- Rotate on security incident

---

## Slack App Security

### Signing Secret Verification

All requests from Slack are verified using signing secret:

```typescript
import crypto from 'crypto';

function verifySlackRequest(request) {
  const timestamp = request.headers['x-slack-request-timestamp'];
  const signature = request.headers['x-slack-signature'];
  
  // Reject if timestamp >5 minutes old
  const requestTime = Math.floor(Date.now() / 1000);
  if (Math.abs(requestTime - parseInt(timestamp)) > 300) {
    return false;
  }

  // Verify signature
  const baseString = `v0:${timestamp}:${request.rawBody}`;
  const hmac = crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(baseString)
    .digest('hex');
  
  return hmac === signature.replace('v0=', '');
}
```

**Why:** Prevents spoofed requests claiming to be from Slack

### OAuth State Token

During installation, state token prevents CSRF attacks:

```typescript
// Generate random state
const state = crypto.randomBytes(32).toString('hex');

// Include in OAuth redirect
const authUrl = `https://slack.com/oauth/v2/authorize?state=${state}&...`;

// Verify on callback
if (callback.state !== session.state) {
  throw new Error('State mismatch - possible CSRF attack');
}
```

---

## Input Validation

### User Input

Always validate data from Slack:

```typescript
// Bad - no validation
const message = body.actions[0].value;
await adapter.postMessage({ text: message });

// Good - validated
const message = body.actions[0].value;
if (typeof message !== 'string' || message.length > 1000) {
  throw new Error('Invalid message');
}
await adapter.postMessage({ text: message });
```

**Validation Rules:**
- User IDs must match Slack format: `U[A-Z0-9]+`
- Channel IDs must match: `C[A-Z0-9]+`
- Message length must be <1000 characters
- Numbers must be in valid range

### File Uploads

**Never upload untrusted files:**

```typescript
// Bad - accept any file
const file = request.files.upload;
await uploadToStorage(file);

// Good - validate file
const file = request.files.upload;
const allowedTypes = ['text/csv', 'text/plain'];
const maxSize = 10 * 1024 * 1024; // 10MB

if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

---

## Database Security

### SQL Injection Prevention

**Always use parameterized queries with TypeORM:**

```typescript
// Bad - SQL injection risk
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good - parameterized
const user = await db
  .createQueryBuilder('user')
  .where('user.id = :userId', { userId })
  .getOne();
```

### Sensitive Data in Logs

**Never log sensitive data:**

```typescript
// Bad - logs token
logger.info('Using token: ' + token);

// Good - log safely
logger.info('API call completed', { userId, status });

// Use correlation ID for debugging
logger.info('Created kudos', { correlationId, userId });
// User can trace full request with correlationId
```

### Database Backups

**Store backups securely:**
- Encrypt at rest
- Restrict access to authorized personnel
- Test restoration regularly
- Keep 30-day retention for compliance

---

## Authorization

### Multi-Tenant Safety

Ensure users can't access other workspaces' data:

```typescript
// Bad - no workspace check
const recognitions = await db
  .getRepository(Recognition)
  .find({ where: { fromId: userId } });

// Good - verify workspace
const recognitions = await db
  .getRepository(Recognition)
  .find({ 
    where: { 
      fromId: userId,
      teamId: RequestContext.get().teamId // Workspace isolation
    } 
  });
```

### Permission Checks

Verify user has permission before operation:

```typescript
// Check if user is workspace admin
const isAdmin = await checkUserRole(userId, teamId, 'admin');
if (!isAdmin) {
  throw new Error('Unauthorized - admin role required');
}

// Allow operation
await updateWorkspaceSettings(teamId, settings);
```

### Rate Limiting

Prevent abuse with rate limiting:

```typescript
// Limit 5 kudos per user per minute
const recentKudos = await db
  .getRepository(Recognition)
  .count({
    where: {
      fromId: userId,
      createdAt: MoreThan(new Date(Date.now() - 60000))
    }
  });

if (recentKudos >= 5) {
  throw new Error('Rate limit exceeded');
}
```

---

## External API Security

### API Key Management

**Protect external API keys:**

```bash
# Do NOT hardcode
// Bad
const apiKey = 'abc123';

// Good - from environment
const apiKey = process.env.GIPHY_API_KEY;
```

### HTTPS Only

Always use HTTPS for external APIs:

```typescript
// Bad - http
const response = await fetch('http://api.example.com/data');

// Good - https
const response = await fetch('https://api.example.com/data');
```

### Request Timeouts

Prevent hanging requests:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch (error) {
  clearTimeout(timeout);
  if (error.name === 'AbortError') {
    throw new Error('Request timeout');
  }
}
```

---

## Error Handling

### Error Message Disclosure

**Never expose internal details in error messages:**

```typescript
// Bad - exposes database details
catch (error) {
  res.status(500).json({ error: error.message });
  // Exposes: "Duplicate entry in users table"
}

// Good - generic error
catch (error) {
  logger.error('Operation failed', { error, userId });
  res.status(500).json({ error: 'Operation failed' });
}
```

### Logging Errors

Log errors with context but not sensitive data:

```typescript
// Log what happened and how to debug
logger.error('Recognition creation failed', {
  correlationId,
  fromId: userId,
  toIds: recipientIds.length, // Count, not IDs
  error: error.message,
  // NOT: error.message might expose DB schema
});
```

---

## Deployment Security

### Environment Isolation

Keep staging and production completely separate:
- Separate Slack apps (staging doesn't use production token)
- Separate databases (staging has test data)
- Separate API keys (staging has test keys)
- Separate URL (staging doesn't have production domain)

### SSH Key Management

**For server access:**
- Use SSH key authentication (no passwords)
- Restrict to specific team members
- Rotate keys when team changes
- Keep private keys secure (don't commit)

### Access Control

**Limit who can deploy:**
- Only authorized DevOps/platform team
- GitHub branch protection rules
- Approval required for production deploys

---

## Monitoring & Alerts

### Security Monitoring

Watch for suspicious activity:

```typescript
// Alert on repeated failed attempts
if (failedAttempts > 5) {
  logger.warn('Suspicious activity detected', {
    userId,
    action: 'failed_authorization',
    attempts: failedAttempts
  });
  // Send alert to security team
}
```

### Audit Logging

Log sensitive operations:

```typescript
// Log all config changes
logger.info('Workspace settings updated', {
  teamId,
  changedBy: userId,
  changes: { channelId: 'C123' },
  timestamp: new Date()
});
```

---

## Security Checklist

Before deploying to production:

- [ ] No secrets in code or logs
- [ ] All user inputs validated
- [ ] Database queries parameterized
- [ ] HTTPS enforced
- [ ] Multi-tenant isolation verified
- [ ] Rate limiting configured
- [ ] Error messages don't leak details
- [ ] SSH key authentication only
- [ ] Backups encrypted
- [ ] Audit logging enabled
- [ ] Security headers configured (CORS, CSP)
- [ ] Dependencies scanned for vulnerabilities
- [ ] SQL injection tests passed
- [ ] CSRF protection enabled
- [ ] XSS protection enabled

---

## Incident Response

If security incident discovered:

1. **Isolate** - Take affected system offline
2. **Investigate** - Understand scope and impact
3. **Notify** - Alert affected users
4. **Remediate** - Fix vulnerability
5. **Monitor** - Watch for re-exploitation
6. **Document** - Record what happened for learning

---

## Questions?

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup security.
