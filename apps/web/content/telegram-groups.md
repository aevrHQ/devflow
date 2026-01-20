# Telegram Group Chat Setup

Learn how to connect Pinga to your Telegram group chats for team notifications.

## Why Use Group Chats?

Group chats are perfect for:

- 👥 **Team Collaboration** - Everyone sees important updates
- 🔔 **Shared Context** - Discuss deployments and issues together
- 📊 **Transparency** - Keep the whole team informed

---

## Prerequisites

Before you begin:

- ✅ Admin access to your Telegram group
- ✅ Pinga account set up
- ✅ Basic understanding of [notification channels](/help/channels)

---

## Step-by-Step Setup

### Step 1: Add the Bot to Your Group

1. Open your Telegram group
2. Tap the group name → **Add Members**
3. Search for `@pingapingbot` (or your bot name)
4. Add the bot to the group

> 💡 **Tip**: You need admin rights to add bots

### Step 2: Configure in Pinga Dashboard

1. Go to **Settings** → **Notification Channels**
2. Click **"Add Channel"** → Select **Telegram**
3. Give it a name (e.g., "Dev Team Notifications")
4. Select **"Group Chat"** option

![Group Chat Toggle](https://via.placeholder.com/600x150/0ea5e9/ffffff?text=Select+Group+Chat)

### Step 3: Copy the Command

You'll see step-by-step instructions:

```
📋 Steps to connect group chat:

1. Add @pingapingbot to your Telegram group
2. In the group, send this command:

   /start channel_696e67f7bf2a31d62e9a9306_1

[📋 Copy Command]
```

Click **"Copy Command"**

### Step 4: Connect in Telegram

1. Go back to your Telegram group
2. Paste the command
3. Send it

![Command in Group](https://via.placeholder.com/600x300/10b981/ffffff?text=Send+Command+in+Group)

### Step 5: Confirmation

The bot will respond:

```
✅ Group Connected Successfully!*

"Dev Team Notifications" is now linked to this group.

🔔 You'll receive filtered notifications here based on your dashboard settings.

💡 Tip: Use /help to see available commands.
```

---

## Important Differences: Group vs Personal

| Feature         | Personal DM     | Group Chat         |
| --------------- | --------------- | ------------------ |
| **Connection**  | Click button    | Copy/paste command |
| **Who Sees**    | Only you        | Entire group       |
| **Permissions** | Any user        | Admin only         |
| **Use Case**    | Personal alerts | Team notifications |

---

## Why Can't I Just Click "Connect"?

**Telegram Limitation**: Deep links (`t.me/bot?start=...`) always open in **personal DMs**, never in groups.

That's why we provide the copy-paste flow for groups. It's a Telegram platform restriction, not a Pinga limitation.

---

## Managing Group Notifications

### Set Up Filters

Configure which events go to which group:

**Example: Production Team**

```yaml
Channel: Production Alerts (Group)
Sources: Render, Vercel
Repositories: company/production-*
Events:
  - deploy.succeeded
  - deploy.failed
```

**Example: Dev Team**

```yaml
Channel: Dev Team (Group)
Sources: GitHub
Repositories:
  - team/frontend
  - team/backend
Events:
  - push
  - pull_request
  - deployment
```

[Learn more about filtering →](/help/filtering)

---

## Multiple Groups

You can connect different groups for different purposes:

1. **#production-alerts** - Critical only
2. **#dev- updates** - All development activity
3. **#deployments** - Deployment status updates

Each group can have its own filters!

---

## Bot Commands in Groups

The bot responds to these commands:

- `/help` - Show available commands
- `/status` - Check connection status
- `/filters` - View current filter settings (coming soon)

---

## Troubleshooting

### "Bot not responding"

**Solution**: Make sure the bot is still in the group:

1. Check group members list
2. Re-add if removed
3. Resend `/start` command

### "Unauthorized"

**Solution**: Only group **admins** can connect channels:

1. Verify you're an admin
2. Ask an admin to run the command

### "Channel already connected"

**Solution**: The channel ID is already linked:

1. Go to Dashboard → Settings
2. Disconnect the old channel
3. Try again

---

## Security & Privacy

### Who Can Connect Groups?

Only Telegram group **administrators** can connect groups to Pinga.

### Can the Bot Read Messages?

**No**. The bot only:

- ✅ Receives commands you send it
- ✅ Sends notifications you've configured
- ❌ Cannot read group conversation
- ❌ Cannot access message history

### Removing the Bot

If you remove the bot from the group:

1. Notifications stop immediately
2. Dashboard shows "disconnected"
3. You can reconnect anytime

---

## Best Practices

### 1. Use Descriptive Names

Good: "Backend Team - Production Alerts"  
Bad: "Telegram Channel 1"

### 2. Set Clear Filters

Don't spam your team! Filter to relevant events only.

### 3. Multiple Groups for Scale

As your team grows:

- **#critical** - Production issues
- **#deploys** - All deployments
- **#github** - Code activity

### 4. Document Your Setup

Keep a note of which group receives what, especially if you have many channels.

---

## Advanced: Multiple Bots

For enterprise teams, you can run multiple Pinga instances with different bots:

- `@pinga-dev-bot` - Development notifications
- `@pinga-prod-bot` - Production alerts
- `@pinga-finance-bot` - Payment webhooks

Each can have separate configurations and access controls.

---

## What's Next?

- [Webhook Filtering](/help/filtering) - Control what notifications you receive
- [Channel Management](/help/channels) - Manage all your channels
- [Webhook Sources](/help/sources) - Connect more services

---

**Questions?** [Contact Support](mailto:support@pinga.app)
