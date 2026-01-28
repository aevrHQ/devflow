# Telegram Webhook Configuration Guide

This guide explains how to configure your Telegram bot to send webhook events to your production domain and manage it with a reusable script.

## Quick Start

### Step 1: Get Your Bot Token

If you don't have a Telegram bot token yet:

1. Open Telegram and search for **@BotFather**
2. Send `/start` and follow the instructions
3. Send `/newbot` and choose a name and username
4. Copy the token you receive

**Your token:** Save this securely - it's needed for webhook configuration

### Step 2: Set Webhook for Production

```bash
# Using the script
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://devflow.aevr.space

# Or manually (see below for manual methods)
```

You should see:

```
✅ Webhook set successfully!
   Description: Webhook was set
```

### Step 3: Verify Configuration

```bash
# Check your webhook is working
node tools/telegram-webhook.js get YOUR_BOT_TOKEN
```

Output:

```
📋 Current Webhook Configuration:
   URL: https://devflow.aevr.space/api/webhook/telegram
   Has Custom Certificate: No
   Pending Update Count: 0
   Max Allowed Connections: 40
   Allowed Updates: message,callback_query
```

---

## How Telegram Webhooks Work

```
User sends message to bot
           ↓
    Telegram servers
           ↓
    (look up webhook URL)
           ↓
    POST to: https://devflow.aevr.space/api/webhook/telegram
           ↓
    Your app processes update
           ↓
    Sends response back
```

**Benefits:**

- Real-time updates (no polling needed)
- Lower latency
- More efficient than polling
- Fewer API calls

**How it's different from polling:**

- ❌ Polling: App constantly asks "Any new messages?" → many API calls
- ✅ Webhook: Telegram tells you immediately → zero unnecessary calls

---

## Setup Methods

### Method 1: Using the Management Script (RECOMMENDED)

The script simplifies webhook management and handles errors gracefully.

#### Installation

No installation needed - the script is pure Node.js:

```bash
cd /path/to/devflow
node tools/telegram-webhook.js --help
```

#### Set Webhook

```bash
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://devflow.aevr.space
```

#### Get Current Configuration

```bash
node tools/telegram-webhook.js get YOUR_BOT_TOKEN
```

#### Change Webhook Domain

```bash
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://new-domain.com
```

#### Delete Webhook (Stop Receiving Updates)

```bash
node tools/telegram-webhook.js delete YOUR_BOT_TOKEN
```

#### Using Environment Variables

```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
export TELEGRAM_WEBHOOK_DOMAIN=https://devflow.aevr.space

# Then run without arguments
node tools/telegram-webhook.js set
node tools/telegram-webhook.js get
```

### Method 2: Manual Setup (cURL)

If you prefer to set the webhook manually:

```bash
# Set webhook
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://devflow.aevr.space/api/webhook/telegram"

# Get webhook info
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"

# Delete webhook
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
```

### Method 3: Telegram Bot API Direct

Use Telegram's official API directly in your browser or application:

```javascript
// Set webhook
const response = await fetch(
  "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://devflow.aevr.space/api/webhook/telegram",
      allowed_updates: ["message", "callback_query"],
      max_connections: 40,
    }),
  },
);

const result = await response.json();
console.log(result);
```

---

## Configuration for Different Environments

### Development (localhost)

⚠️ **Note:** Telegram webhooks require HTTPS with a valid certificate. Localhost doesn't work!

**Solutions:**

1. Use a tunneling service (ngrok, localtunnel)
2. Deploy to staging and test there
3. Use polling with `getUpdates` for local testing

```bash
# Option 1: Using ngrok (temporary local testing)
ngrok http 3000
# Copy the HTTPS URL and use it
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://abc123.ngrok.io

# Option 2: Switch back to polling locally
# In your code, use getUpdates() instead of webhook
```

### Staging (staging.devflow.dev)

```bash
# Set staging webhook
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://staging.devflow.dev
```

### Production (devflow-web.vercel.app)

```bash
# Set production webhook
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://devflow.aevr.space
```

---

## Your Webhook Endpoint

Your app receives webhook updates at:

```
POST https://devflow.aevr.space/api/webhook/telegram
```

**Location:** `apps/web/app/api/webhook/telegram/route.ts`

**What it does:**

- Receives message updates from Telegram
- Processes text and voice messages
- Handles DevFlow commands
- Sends responses back to users

---

## Troubleshooting

### "Webhook was not set"

**Cause:** Invalid domain or API error

**Solutions:**

```bash
# 1. Verify your domain is HTTPS
https://devflow.aevr.space  # ✅ Good
http://devflow-web.vercel.app   # ❌ Bad (must be HTTPS)

# 2. Verify your bot token is correct
node tools/telegram-webhook.js get YOUR_BOT_TOKEN

# 3. Check if the endpoint is accessible
curl -v https://devflow.aevr.space/api/webhook/telegram
# Should return 405 (POST method required) or other response
```

### "Last Error: Connection timeout"

**Cause:** Your server is unreachable or not responding

**Solutions:**

```bash
# 1. Check if your app is running
curl https://devflow.aevr.space/health
# Should return healthy status

# 2. Verify the webhook URL is correct
node tools/telegram-webhook.js get YOUR_BOT_TOKEN

# 3. Check application logs for errors
# Look in Vercel dashboard or your server logs

# 4. Restart the bot (delete and recreate webhook)
node tools/telegram-webhook.js delete YOUR_BOT_TOKEN
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://devflow.aevr.space
```

### "Pending Update Count: high number"

**Cause:** Updates are queued because webhook isn't being processed

**Solutions:**

```bash
# Option 1: Delete and recreate webhook (drops pending updates)
node tools/telegram-webhook.js delete YOUR_BOT_TOKEN --drop-pending
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://devflow.aevr.space

# Option 2: Just drop pending updates without recreating
node tools/telegram-webhook.js delete YOUR_BOT_TOKEN --drop-pending
```

### Not Receiving Messages

**Check list:**

1. Webhook URL is correct: `https://devflow.aevr.space/api/webhook/telegram`
2. Bot token is correct
3. Your app is running and accessible
4. No pending errors: `node tools/telegram-webhook.js get YOUR_BOT_TOKEN`
5. Send a test message to your bot

**Debug:**

```bash
# Enable debug logs in your app
NODE_ENV=development npm run dev

# Send a message to your bot
# Check console for: "[Telegram Webhook] Raw Update:"
```

---

## Managing Multiple Environments

Create environment-specific scripts:

```bash
# scripts/telegram-setup-prod.sh
#!/bin/bash
set -e

BOT_TOKEN=$TELEGRAM_BOT_TOKEN
DOMAIN="https://devflow.aevr.space"

echo "Setting up Telegram webhook for PRODUCTION"
node tools/telegram-webhook.js set "$BOT_TOKEN" "$DOMAIN"
echo "✅ Production webhook configured"
```

```bash
# scripts/telegram-setup-staging.sh
#!/bin/bash
set -e

BOT_TOKEN=$TELEGRAM_BOT_TOKEN_STAGING
DOMAIN="https://staging.devflow.dev"

echo "Setting up Telegram webhook for STAGING"
node tools/telegram-webhook.js set "$BOT_TOKEN" "$DOMAIN"
echo "✅ Staging webhook configured"
```

Run setup:

```bash
# Production
TELEGRAM_BOT_TOKEN=prod_token bash scripts/telegram-setup-prod.sh

# Staging
TELEGRAM_BOT_TOKEN=staging_token bash scripts/telegram-setup-staging.sh
```

---

## Automation with CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/telegram-webhook.yml
name: Configure Telegram Webhook

on:
  workflow_dispatch: # Manual trigger
  push:
    branches: [main]

jobs:
  webhook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set Telegram webhook
        run: |
          node tools/telegram-webhook.js \
            set "${{ secrets.TELEGRAM_BOT_TOKEN }}" \
            https://devflow.aevr.space
```

Use it:

```bash
# Manually trigger in GitHub Actions
# Or push to main branch to auto-configure
```

### Vercel Post-Deployment

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "env": {
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token"
  }
}
```

---

## Best Practices

### Security

✅ **DO:**

- Keep bot token secure (use environment variables)
- Use HTTPS for webhook domain
- Validate incoming requests
- Regenerate token if compromised

❌ **DON'T:**

- Commit token to git
- Share token in logs
- Use HTTP (must be HTTPS)
- Log sensitive data

### Webhook Management

✅ **DO:**

- Use the management script for consistency
- Check webhook status regularly
- Test after domain changes
- Keep logs of changes
- Document your setup

❌ **DON'T:**

- Manually edit webhook config in code
- Use multiple webhook URLs for same bot
- Leave old webhooks active
- Ignore errors in logs

### Reliability

✅ **DO:**

- Monitor pending update count
- Set appropriate timeout values
- Handle network failures gracefully
- Test webhook with actual messages
- Monitor application logs

❌ **DON'T:**

- Assume webhook is always working
- Ignore "last error" messages
- Deploy without testing
- Leave debug logs in production

---

## Webhook Update Types

By default, your bot receives these update types:

- `message` - Text and voice messages
- `callback_query` - Button clicks

**To receive other updates:**

```bash
# All updates
node tools/telegram-webhook.js set YOUR_BOT_TOKEN \
  https://devflow.aevr.space \
  --allowed-updates message,callback_query,edited_message,channel_post

# Only messages (no callbacks)
node tools/telegram-webhook.js set YOUR_BOT_TOKEN \
  https://devflow.aevr.space \
  --allowed-updates message
```

**Common update types:**

- `message` - New messages
- `callback_query` - Button clicks
- `edited_message` - Edited messages
- `channel_post` - Channel posts
- `my_chat_member` - Bot added/removed
- `chat_member` - User added/removed

---

## Webhook Certificate

For advanced setups with custom certificates:

```bash
# Set webhook with certificate (rarely needed)
curl -F "url=https://devflow.aevr.space/api/webhook/telegram" \
     -F "certificate=@/path/to/cert.pem" \
     https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

**When needed:**

- Custom domains with self-signed certificates
- Private infrastructure
- Enterprise setups

**For Vercel/standard hosting:** Not needed - Telegram trusts standard CAs

---

## Testing Your Webhook

### Method 1: Send Test Message

```bash
# Just send a message to your bot via Telegram
# Check your app logs for webhook event

# In your app, you should see:
# [Telegram Webhook] Raw Update: { ... }
```

### Method 2: Simulate Webhook (Advanced)

```bash
# Send test webhook payload
curl -X POST https://devflow.aevr.space/api/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456,
    "message": {
      "message_id": 1,
      "date": 1234567890,
      "chat": {"id": 789, "type": "private"},
      "text": "Hello bot!"
    }
  }'
```

---

## Useful Commands

```bash
# Set production webhook
node tools/telegram-webhook.js set $TELEGRAM_BOT_TOKEN https://devflow.aevr.space

# Get current webhook info
node tools/telegram-webhook.js get $TELEGRAM_BOT_TOKEN

# Delete webhook (use before changing domain)
node tools/telegram-webhook.js delete $TELEGRAM_BOT_TOKEN

# Delete and drop pending updates
node tools/telegram-webhook.js delete $TELEGRAM_BOT_TOKEN --drop-pending

# View webhook info with pending updates
node tools/telegram-webhook.js get $TELEGRAM_BOT_TOKEN

# Help
node tools/telegram-webhook.js help
```

---

## Integration with DevFlow

Your webhook integrates with DevFlow's command system:

1. **User sends message to bot**
   ↓
2. **Telegram sends webhook to devflow-web.vercel.app/api/webhook/telegram**
   ↓
3. **DevFlow processes the message**
   - Extracts text/voice
   - Parses commands
   - Queries database
   - Calls Copilot agent
     ↓
4. **DevFlow sends response back via Telegram API**
   ↓
5. **User sees response in Telegram**

---

## FAQ

**Q: Can I change webhook domain without downtime?**
A: Yes! Just set the new webhook URL. Telegram will route messages to the new domain.

**Q: What if I deploy to a new domain?**
A: Update the webhook with the new domain:

```bash
node tools/telegram-webhook.js set YOUR_BOT_TOKEN https://new-domain.com
```

**Q: How often should I check webhook status?**
A: Monitor key metrics regularly:

- Last error (should be empty)
- Pending update count (should be low)
- Response status

**Q: Can I use the same bot on multiple domains?**
A: No - one bot can only have one active webhook. For multiple deployments, use different bot tokens.

**Q: What happens to old messages if I delete the webhook?**
A: They're stored by Telegram but not delivered. Use `--drop-pending` to clear them.

**Q: Is webhook faster than polling?**
A: Yes - webhook delivers updates immediately. Polling checks periodically (e.g., every 30 seconds).

---

## Further Reading

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Webhook Documentation](https://core.telegram.org/bots/api#setwebhook)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
