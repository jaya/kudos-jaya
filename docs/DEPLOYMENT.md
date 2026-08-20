# Deployment & Setup Guide

This guide covers deploying Kudos Jaya to staging and production environments.

## Prerequisites

### Local Development

- Node.js 24.x or higher
- npm (comes with Node.js)
- PostgreSQL 12+
- Git
- Ngrok (for local Slack development)

### Staging/Production

- Docker (optional but recommended)
- Docker Compose
- SSH access to deployment server
- GitHub access (for CI/CD)

---

## Environment Variables

Create `.env` file with these variables:

### Slack Configuration

```bash
# Slack app credentials (from https://api.slack.com/apps)
SLACK_CLIENT_ID=xoxb-your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_STATE_SECRET=random-secret-for-oauth-security
```

### Database

```bash
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=kudos_jaya
```

### Encryption

```bash
# 32-character key for encrypting stored tokens
ENCRYPTION_KEY=your-32-character-encryption-key
```

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### External APIs

```bash
# Giphy API for GIF preview
GIPHY_API_KEY=your-giphy-api-key

# Todo Cartões (gift card API)
TODO_API_BASE_URL=https://api.todocartoes.com
TODO_API_KEY=your-todo-api-key
```

### Optional

```bash
# Application port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development

# Logging level
LOG_LEVEL=info
```

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/jaya/kudos-jaya.git
cd kudos-jaya
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Create database
createdb kudos_jaya

# Run migrations
npm run migration:up
```

### 4. Configure Slack App

1. Create app at https://api.slack.com/apps
2. Add slash commands: `/give-kudos`, `/cancel-kudos`
3. Set interactivity URL to ngrok URL (see below)
4. Copy credentials to `.env`

### 5. Start Development Server

In one terminal:
```bash
ngrok http 3000
```

Note the ngrok URL (e.g., `https://abc123.ngrok.io`).

In another terminal:
```bash
npm run start:local
```

This starts:
- Main app on http://localhost:3000
- Mock server on http://localhost:3001

### 6. Update Slack Manifest

Update `manifest.json` with ngrok URL:
```json
{
  "request_url": "https://abc123.ngrok.io/slack/events",
  "options_load_url": "https://abc123.ngrok.io/slack/options"
}
```

Go to Slack API app → App Manifest → paste updated JSON

### 7. Install to Workspace

Visit: `https://abc123.ngrok.io/slack/install/workspace`

Follow OAuth flow to install to your workspace.

---

## Staging Deployment

### Using Docker Compose (Recommended)

1. Copy `.env.staging` to `.env`
2. Update with staging values
3. Run:
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Manual Deployment to DigitalOcean

#### Prerequisites

- DigitalOcean account with SSH key
- Domain or subdomain for staging app
- SSL certificate

#### Steps

1. **SSH to Droplet**
```bash
ssh root@your-staging-server.com
```

2. **Install Dependencies**
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql-client

# Install PM2 process manager
sudo npm install -g pm2
```

3. **Clone Repository**
```bash
cd /opt
git clone https://github.com/jaya/kudos-jaya.git
cd kudos-jaya
npm install
```

4. **Setup Environment**
```bash
cp .env.example .env
nano .env  # Edit with staging values
```

5. **Setup Database**
```bash
# Connect to managed PostgreSQL database
npm run migration:up -- --db-url "postgresql://..."
```

6. **Start with PM2**
```bash
npm run build
pm2 start ecosystem.config.js --env staging
pm2 save
```

7. **Setup Nginx Reverse Proxy**
```bash
sudo apt-get install -y nginx

# Create config in /etc/nginx/sites-available/kudos-staging
# Point domain to localhost:3000
# Setup SSL with Let's Encrypt
sudo certbot certonly --nginx -d staging-kudos.jaya.com
```

8. **Update Slack Manifest**
- Point to staging URL
- Install staging app to test workspace

---

## Production Deployment

### Requirements

- 2+ servers for high availability
- Load balancer
- PostgreSQL managed database (e.g., AWS RDS)
- Redis cache (optional)
- Monitoring and logging

### Deployment Process

#### 1. Prepare Release

```bash
# Create release tag
git tag v1.8.0
git push origin v1.8.0
```

#### 2. GitHub Actions Pipeline

Automatically triggered on push to `main`:
1. Run tests
2. Build Docker image
3. Push to registry
4. Trigger production deployment

**Workflow:** `.github/workflows/deploy.yml`

#### 3. Blue-Green Deployment

Production uses blue-green strategy:
1. Deploy new version to "green" servers
2. Run smoke tests
3. Switch load balancer to "green"
4. Keep "blue" running for quick rollback

#### 4. Database Migration

Migrations run automatically during deployment:
```bash
npm run migration:up
```

Rollback if needed:
```bash
npm run migration:down
```

#### 5. Cache Invalidation

After deployment, clear caches:
```bash
redis-cli FLUSHALL
```

---

## Monitoring & Logging

### Logs

View logs with PM2:
```bash
# Real-time logs
pm2 logs kudos-jaya

# Search for errors
pm2 logs kudos-jaya --err | grep error

# Export logs
pm2 logs kudos-jaya > logs.txt
```

### Health Checks

App exposes `/health` endpoint:
```bash
curl https://your-app.com/health
# Response: { "status": "ok", "uptime": 12345 }
```

### Performance Monitoring

Monitor key metrics:
```bash
# CPU and memory usage
pm2 monit

# Database connection pool
# Check logs for "connection pool"

# Request latency
# Logged to stdout with request IDs
```

### Error Tracking

Errors are logged with correlation IDs:
```
correlationId=abc123 teamId=T456 error="..."
```

Use correlation ID to trace requests:
```bash
pm2 logs kudos-jaya | grep "abc123"
```

---

## Rollback Procedure

If deployment fails:

### Automatic (Blue-Green)
1. Health checks fail on "green"
2. Load balancer stays on "blue"
3. Previous version still running
4. No manual action needed

### Manual Rollback
```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# GitHub Actions automatically redeploys
```

---

## Scaling

### Horizontal Scaling

Add more servers:
1. Clone code on new server
2. Install dependencies
3. Point database to shared PostgreSQL
4. Point cache to shared Redis
5. Add to load balancer

### Database Scaling

As load increases:
1. Add read replicas for queries
2. Add database indexes on frequently queried fields
3. Implement query caching with Redis
4. Consider database sharding by workspace

---

## Database Backups

### Automated Backups

PostgreSQL should be configured for:
- Daily backups
- 30-day retention
- Cross-region replication

### Manual Backup

```bash
pg_dump kudos_jaya > backup.sql
```

### Restore from Backup

```bash
psql kudos_jaya < backup.sql
```

---

## SSL/TLS Certificates

### Let's Encrypt (Automatic)

```bash
sudo certbot renew --nginx
```

Runs automatically via cron job.

### Certificate Renewal

Certificates auto-renew 30 days before expiry. Monitor:
```bash
sudo certbot certificates
```

---

## Environment-Specific Configuration

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| NODE_ENV | development | staging | production |
| LOG_LEVEL | debug | info | warn |
| DB_HOST | localhost | managed-db.staging | managed-db.prod |
| Slack Client ID | dev-app | staging-app | prod-app |
| Slack Workspace | Personal | Company-Test | Company-Live |

---

## Troubleshooting Deployment

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```bash
# Test connection
psql postgresql://user:pass@host/db

# Check environment variables
env | grep DB_
```

### Slack Events Not Received
1. Check manifest points to correct URL
2. Verify signing secret matches
3. Check firewall allows inbound traffic
4. Verify request URL accessible: `curl https://your-app.com/slack/events`

### High Memory Usage
```bash
# Restart app
pm2 restart kudos-jaya

# Check for memory leaks in logs
pm2 logs kudos-jaya | grep "heap"
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] Database migrations tested on staging
- [ ] Environment variables configured
- [ ] Slack app credentials correct
- [ ] SSL certificate valid
- [ ] Backup exists
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Health endpoint accessible after deployment

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for full pre-deployment checklist.
