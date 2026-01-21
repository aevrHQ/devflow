# Getting Started with Pinga

![Pinga Logo](https://via.placeholder.com/800x200/0ea5e9/ffffff?text=Pinga+Notification+Hub)

Welcome to **Pinga** - your centralized notification hub for all your developer webhooks! This guide will help you get started in minutes.

## What is Pinga?

Pinga is a powerful notification management system that receives webhooks from your favorite services (GitHub, Render, Vercel, Stripe, and more) and intelligently routes them to your preferred channels like Telegram, Discord, or Slack.

### Key Features

✅ **Multi-Channel Support** - Send notifications to Telegram, Discord, Slack  
✅ **Smart Filtering** - Control which events trigger notifications  
✅ **AI Summarization** - Get concise summaries of complex webhooks  
✅ **Team Collaboration** - Connect group chats for team notifications  
✅ **Secure & Private** - Your data stays in your control

---

## Quick Start (5 Minutes)

### Step 1: Create Your Account

1. Visit [https://pinga.yoursite.com](/)
2. Enter your email
3. Click the magic link sent to your inbox
4. You're in! 🎉

### Step 2: Configure Your First Channel

#### For Telegram (Recommended):

1. Go to **Settings** → **Notification Channels**
2. Click **"Add Channel"** → Select **Telegram**
3. Give it a name (e.g., "My Personal Notifications")
4. Choose chat type:
   - **Personal DM**: For your private messages
   - **Group Chat**: For team notifications

**For Personal DM:**

- Click **"Connect with Telegram"**
- Telegram will open automatically
- Send `/start` to the bot
- ✅ You're connected!

**For Group Chat:**

1. Add `@pingapingbot` to your Telegram group
2. Click **"Copy Command"** in the dashboard
3. Paste the command in your group
4. ✅ Group connected!

#### For Slack:

1. Go to **Settings** → **Notification Channels**
2. Click **"Add Slack"**
3. Click **"Connect with Slack"**
4. Authorize the app to access your workspace
5. ✅ You're connected!

### Step 3: Set Up Your First Webhook

#### GitHub Example:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. **Payload URL**: `https://pinga.yoursite.com/api/webhook/github`
4. **Content type**: `application/json`
5. **Secret**: _(optional)_
6. **Events**: Choose what triggers notifications
7. Click **Add webhook**

🎉 **You'll now receive GitHub notifications in Telegram!**

---

## What's Next?

- [Advanced Filtering](/help/filtering) - Control which events trigger notifications
- [Multiple Channels Setup](/help/channels) - Route different events to different channels
- [Team Collaboration](/help/teams) - Set up group chats for your team
- [Webhook Sources](/help/sources) - Connect more services

---

## Need Help?

- 📖 [Full Documentation](/help)
- 💬 [Join our Community](https://t.me/pingacommunity)
- 🐛 [Report Issues](https://github.com/yourrepo/issues)

---

**Happy notifying! 🚀**
