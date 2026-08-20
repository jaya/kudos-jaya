# Troubleshooting Guide

Common issues and solutions for Kudos Jaya development and deployment.

## Development Issues

### App Not Receiving Slack Events

**Symptom:** Slack commands don't trigger handlers, no logs appear

**Checklist:**
1. Ngrok running and URL correct?
   ```bash
   ngrok http 3000
   # Copy URL and verify it's accessible: curl https://abc123.ngrok.io/health
   ```

2. Manifest updated with ngrok URL?
   - Update `manifest.json`
   - Paste into Slack API app → App Manifest

3. App reinstalled after manifest change?
   ```bash
   # Visit install URL to reinstall
   https://abc123.ngrok.io/slack/install/workspace
   ```

4. Signing secret correct in `.env`?
   ```bash
   grep SLACK_SIGNING_SECRET .env
   # Compare with Slack API app → Basic Information
   ```

5. Firewall blocking inbound traffic?
   ```bash
   # Test from another machine
   curl https://your-ngrok-url/health
   ```

**Solution:** Most common cause is stale ngrok URL or missing reinstall. Recreate ngrok tunnel and reinstall app.

---

### Database Connection Error

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Checklist:**
1. PostgreSQL running?
   ```bash
   psql postgres -c "SELECT 1"
   # If fails, start: brew services start postgresql (macOS)
   ```

2. Database exists?
   ```bash
   psql postgres -c "\l" | grep kudos_jaya
   # If not: createdb kudos_jaya
   ```

3. Environment variables correct?
   ```bash
   grep DB_ .env
   # Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
   ```

4. Migrations applied?
   ```bash
   npm run migration:up
   ```

**Solution:** Verify PostgreSQL running, database created, and `.env` has correct credentials.

---

### "Cannot find module" Error

**Symptom:** `Error: Cannot find module '@/features/kudos'`

**Checklist:**
1. Dependencies installed?
   ```bash
   npm install
   ```

2. TypeScript paths configured?
   - Check `tsconfig.json` has path aliases
   - Verify file exists at path

3. Node modules corrupted?
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

**Solution:** Reinstall dependencies and rebuild TypeScript.

---

### Handler Tests Failing

**Symptom:** Jest tests fail with mocking errors

**Common Issues:**

1. **Mock not setup correctly**
   ```typescript
   // Wrong - mock after import
   import { Service } from './service';
   jest.mock('./service');

   // Correct - mock before import
   jest.mock('./service');
   import { Service } from './service';
   ```

2. **RequestContext.get() returns undefined**
   ```typescript
   // Add to test setup
   (RequestContext.get as jest.Mock).mockReturnValue({
     adapter: mockAdapter,
     teamId: 'team123',
   });
   ```

3. **Adapter method not mocked**
   ```typescript
   const mockAdapter = {
     postMessage: jest.fn().mockResolvedValue(undefined),
     // Add all methods used in handler
   };
   ```

**Solution:** Check mock setup in `beforeEach` block and verify all dependencies are mocked.

---

## Deployment Issues

### Database Migration Fails

**Symptom:** Deployment stops with migration error

**Checklist:**
1. Migration file valid?
   ```bash
   npm run migration:up -- --verbose
   # Check error message
   ```

2. Database accessible?
   ```bash
   psql $DB_URL -c "SELECT 1"
   ```

3. Rollback previous migration?
   ```bash
   npm run migration:down
   npm run migration:up
   ```

**Solution:** Review migration error, fix SQL, and reapply with `npm run migration:up`.

---

### High CPU/Memory Usage

**Symptom:** Server slow, PM2 shows high memory

**Checklist:**
1. Memory leak?
   ```bash
   # Check recent logs for growing heap usage
   pm2 logs kudos-jaya | tail -100
   ```

2. Infinite loops?
   ```bash
   # Look for repeated log messages
   pm2 logs kudos-jaya | sort | uniq -c | sort -rn | head
   ```

3. Slow database queries?
   ```bash
   # Check query logs for slow queries
   # Example: queries taking >1 second
   ```

4. External API timeout?
   ```bash
   # Check for hanging requests to Giphy/Todo APIs
   # Logs show "timeout waiting for response"
   ```

**Solution:** Restart service, check for infinite loops in logs, optimize slow queries, add timeouts to external API calls.

---

### Slack API Rate Limiting

**Symptom:** `Error: rate_limited` in logs

**Context:** Slack limits to ~1 request/second per method

**Solution:**
1. Add exponential backoff retry logic
2. Batch operations where possible
3. Cache user/channel info locally
4. Use WebSocket instead of polling

---

### "Workspace Installation Not Recognized"

**Symptom:** Handler runs but workspace not found in database

**Checklist:**
1. Installation completed?
   ```bash
   # Verify in database
   psql kudos_jaya -c "SELECT * FROM installation WHERE team_id='T123';"
   ```

2. OAuth redirect handled?
   - Check logs for "oauth_redirect"
   - Verify token stored

3. Multiple installations?
   ```bash
   # Check for duplicate team_id
   psql kudos_jaya -c "SELECT team_id, COUNT(*) FROM installation GROUP BY team_id HAVING COUNT(*) > 1;"
   ```

**Solution:** Check database for installation record; reinstall if needed.

---

### External API Failures

**Symptom:** `Error: Failed to fetch from Giphy` or `Error: Failed to redeem card`

**Giphy API:**
```bash
# Test connection
curl -X GET "https://api.giphy.com/v1/gifs/random?api_key=$GIPHY_API_KEY"

# Check API key
grep GIPHY_API_KEY .env

# Check rate limits (Giphy has generous limits)
```

**Todo Cartões API:**
```bash
# Test connection
curl -X GET "$TODO_API_BASE_URL/products" \
  -H "Authorization: Bearer $TODO_API_KEY"

# Check credentials
grep TODO_ .env
```

**Solution:** Verify API keys, check API status pages, add retry logic with exponential backoff.

---

### "Signing Secret Mismatch"

**Symptom:** Slack events rejected with "Invalid signature"

**Cause:** Signing secret wrong or timestamp too old

**Checklist:**
1. Correct signing secret?
   ```bash
   grep SLACK_SIGNING_SECRET .env
   # Compare with Slack API app → Basic Information
   ```

2. System clock correct?
   ```bash
   date
   # Slack allows 5-minute clock skew
   ```

3. Raw body used for signature?
   ```typescript
   // Must use raw body string, not parsed JSON
   const hmac = crypto.createHmac('sha256', secret).update(`v0:${ts}:${rawBody}`);
   ```

**Solution:** Update signing secret and verify system clock.

---

### Workspace Configuration Lost

**Symptom:** Settings lost after deployment

**Likely Cause:** Database not persisting

**Checklist:**
1. Database connection maintained across deployments?
   ```bash
   # Database should be external (RDS, managed service)
   # Not local to app container
   ```

2. Backup exists?
   ```bash
   # Create daily backups of PostgreSQL
   pg_dump kudos_jaya > backup-$(date +%Y%m%d).sql
   ```

**Solution:** Use managed database service (AWS RDS, DigitalOcean Managed Databases) instead of local PostgreSQL.

---

## Performance Issues

### Slow Wallet Report Generation

**Symptom:** CSV generation takes >5 seconds

**Optimization:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_wallet_user_id ON wallet(user_id);
   CREATE INDEX idx_recognition_date ON recognition(created_at);
   ```

2. Cache frequent reports:
   ```bash
   # Reports generated in last hour cached in Redis
   ```

3. Generate in background:
   ```typescript
   // Queue report generation instead of blocking request
   queue.add({ type: 'generate_report', userId });
   ```

---

### Modal Submission Timeout

**Symptom:** "Timeout waiting for acknowledgement" from Slack

**Cause:** Validation/processing takes >3 seconds

**Solution:**
1. Acknowledge immediately:
   ```typescript
   await ack(); // First line of handler
   ```

2. Move heavy work to background:
   ```typescript
   await ack();
   // Heavy validation now
   ```

3. Split into multiple modals:
   - Modal 1: User selection
   - Modal 2: Confirmation

---

### Database Connection Pool Exhausted

**Symptom:** `Error: no more connections available`

**Cause:** Connections not released (leak)

**Debug:**
```bash
# Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='kudos_jaya';"

# See queries
psql -c "SELECT query FROM pg_stat_activity WHERE datname='kudos_jaya';"
```

**Solution:**
1. Restart app (closes all connections)
2. Increase pool size in TypeORM config
3. Fix connection leak in code

---

## Getting Help

If issue not listed here:

1. **Check logs**
   ```bash
   # Local
   npm start 2>&1 | tail -100

   # Production
   pm2 logs kudos-jaya --err
   ```

2. **Search correlation ID**
   ```bash
   # Each request has correlationId in logs
   pm2 logs | grep "correlationId=abc123"
   ```

3. **Enable debug logging**
   ```bash
   DEBUG=* npm start
   ```

4. **Check Slack API status**
   - https://status.slack.com

5. **Open issue**
   - Include logs, error message, and reproduction steps
