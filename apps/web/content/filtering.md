# Webhook Filtering Guide

Learn how to control which notifications you receive by setting up intelligent filters for each channel.

## Why Filter Webhooks?

Different channels serve different purposes:

- **Personal DM**: Critical alerts only
- **Team Group**: All deployment updates
- **Dev Channel**: Everything from development repos

Filtering helps you avoid notification fatigue while staying informed.

---

## Filter Types

### 1. Source Filtering

Control which platforms trigger notifications:

- ✅ GitHub
- ✅ Render
- ✅ Vercel
- ✅ Stripe
- ✅ Custom webhooks

### 2. Repository Filtering (GitHub)

For GitHub webhooks, you can specify exact repositories:

```
aevrHQ/pinga-mvp
aevrHQ/website
myorg/backend-api
```

**Leave empty** to receive events from all repositories.

### 3. Event Type Filtering

Choose specific event types:

**GitHub Events:**

- `push` - Code pushes
- `pull_request` - PR opened/closed/merged
- `issues` - Issue activity
- `deployment` - Deployment events
- `release` - New releases
- And 20+ more...

**Render Events:**

- `deploy.succeeded`
- `deploy.failed`
- `deploy.started`

**Vercel Events:**

- `deployment.created`
- `deployment.succeeded`
- `deployment.failed`

---

## Setting Up Filters

### Step 1: Navigate to Channel Settings

1. Go to **Dashboard** → **Settings**
2. Find your notification channel
3. Expand **"Webhook Filters"**

### Step 2: Enable Sources

Toggle on the sources you want to receive:

![Enable Sources](https://via.placeholder.com/600x200/10b981/ffffff?text=Source+Toggles)

### Step 3: Configure Repository Filters

For GitHub:

1. Type repository name: `owner/repo`
2. Press Enter or click **"+"**
3. Add multiple repos as needed
4. Click **"X"** to remove

> 💡 **Tip**: Leave blank to receive all repos

### Step 4: Select Event Types

Check the events you want to monitor:

```
☑ push
☑ pull_request
☑ deployment
☐ issues
☐ star
```

### Step 5: Auto-Save

Changes save automatically! ✅

---

## Example Configurations

### Personal Alerts (Critical Only)

**Channel**: My Telegram DM  
**Sources**: GitHub, Render  
**Repositories**: `company/production-api`  
**Events**:

- `deployment`
- `push` (to main branch)

**Result**: Only production deployments and main branch pushes

---

### Team Channel (All Development)

**Channel**: Dev Team Group  
**Sources**: GitHub  
**Repositories**:

- `team/frontend`
- `team/backend`
- `team/mobile-app`

**Events**:

- `push`
- `pull_request`
- `pull_request_review`
- `deployment`

**Result**: Full visibility into all development activity

---

### Finance Channel (Payments)

**Channel**: Finance Group  
**Sources**: Stripe  
**Events**: All payment-related events

**Result**: Real-time payment notifications

---

##Common Patterns

### 1. Production Monitoring

```yaml
Source: Render + Vercel
Repositories: production-*
Events:
  - deploy.succeeded
  - deploy.failed
```

### 2. PR Review Queue

```yaml
Source: GitHub
Repositories: all
Events:
  - pull_request (opened)
  - pull_request_review_requested
```

### 3. Security Alerts

```yaml
Source: GitHub
Events:
  - security_advisory
  - dependabot_alert
```

---

## Advanced Tips

### Combining Multiple Channels

Set up a hierarchy:

1. **Critical**: Production failures only
2. **Important**: All deployments
3. **Info**: Everything else

### Using Regex (Coming Soon)

Filter by branch names, PR titles, etc.

### Webhook Forwarding (Coming Soon)

Forward filtered webhooks to other services

---

## Troubleshooting

### Not Receiving Expected Notifications?

1. Check source is **enabled**
2. Verify repository name is **exact match**
3. Ensure event type is **selected**
4. Test webhook in original service

### Receiving Too Many Notifications?

1. Add repository filters
2. Narrow event types
3. Use multiple channels for different priorities

---

## What's Next?

- [Channel Management](/help/channels)
- [Group Chat Setup](/help/groups)
- [AI Summarization](/help/ai)

---

**Questions?** [Contact Support](mailto:support@pinga.app)
