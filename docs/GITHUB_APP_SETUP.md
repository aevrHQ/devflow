# GitHub App Setup for DevFlow

This guide explains how to set up your GitHub App and configure it with DevFlow.

## ✅ What You've Already Done

You've created a GitHub App called **"The Devflow Bot"** with:

- **App ID:** `gh_app_id`
- **Client ID:** `gh_client_id`
- **Client Secret:** `gh_copilot_secret` (regenerate if compromised)
- **Public Link:** https://github.com/apps/the-devflow-bot

---

## 🔧 Configuration Steps

### Step 1: Update Your Environment Variables

Copy the GitHub App credentials into your `.env.local` files:

**apps/agent/.env.local:**

```bash
GITHUB_CLIENT_ID=gh_client_id
GITHUB_CLIENT_SECRET=gh_copilot_secret
```

**apps/agent-host/.env.local:**

```bash
GITHUB_APP_ID=gh_app_id
GITHUB_CLIENT_ID=gh_client_id
GITHUB_CLIENT_SECRET=gh_copilot_secret
```

**apps/web/.env.local:**

```bash
GITHUB_APP_ID=gh_app_id
GITHUB_CLIENT_ID=gh_client_id
GITHUB_CLIENT_SECRET=gh_copilot_secret
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

### Step 2: Configure GitHub App Settings

Go to https://github.com/settings/apps/the-devflow-bot and configure:

#### **Authorization callback URL**

Set to your web platform URL:

- **Development:** `http://localhost:3000/api/auth/github/callback`
- **Production:** `https://yourdomain.com/api/auth/github/callback`

#### **Webhook URL** (Optional - for real-time GitHub events)

Set to your agent-host server:

- **Development:** `http://localhost:3001/webhook/github`
- **Production:** `https://yourdomain.com/webhook/github`

#### **Permissions** (Recommended)

Request the minimum permissions needed:

| Permission     | Scope                | Why                    |
| -------------- | -------------------- | ---------------------- |
| **Repository** | `contents:read`      | Read code files        |
| **Repository** | `pull_requests:read` | Read PR information    |
| **Repository** | `issues:read`        | Read issue details     |
| **User**       | `user:email`         | Get user email         |
| **User**       | `read:org`           | Read organization info |

#### **Where your app can be installed**

- ☑️ Any account (recommended for public SaaS)
- ☑️ Only on this account (recommended for internal use)

### Step 3: Regenerate Client Secret (if needed)

If your secret is ever compromised:

1. Go to https://github.com/settings/apps/the-devflow-bot
2. Scroll to "Client secrets"
3. Click "Generate a new client secret"
4. Copy the new secret
5. Update your `.env.local` files
6. Restart your applications

---

## 🔐 Security Best Practices

### DO:

✅ Keep Client Secret out of version control (use .env.local or GitHub Secrets)
✅ Rotate secrets every 90 days
✅ Use different secrets per environment (dev/staging/prod)
✅ Regenerate if secret is accidentally committed
✅ Monitor GitHub App activity for suspicious access
✅ Use minimal required permissions
✅ Enable webhook secret verification

### DON'T:

❌ Commit Client Secret to git
❌ Share secrets in email, Slack, or chat
❌ Use same secret in multiple environments
❌ Log secrets in application output
❌ Request excessive permissions
❌ Disable webhook secret verification

---

## 🚀 Installation & OAuth Flow

### For Users

Users install your GitHub App from:

```
https://github.com/apps/the-devflow-bot/installations/new
```

Or via your web platform:

1. Click "Connect GitHub Account"
2. Redirects to GitHub OAuth authorization
3. User approves permissions
4. Redirects back to `https://yourdomain.com/api/auth/github/callback`
5. Your app receives OAuth token

### For Developers (Local Testing)

1. Visit `http://localhost:3000/login`
2. Click "Connect GitHub"
3. GitHub redirects to authorization page
4. Approve permissions
5. Redirected back to callback URL
6. Should now be logged in

---

## 🐛 Troubleshooting

### "Invalid Client ID" Error

- Verify `GITHUB_CLIENT_ID` in `.env.local` matches GitHub settings
- Check it's the Client ID, not the App ID

### "Redirect URI mismatch" Error

- Ensure `GITHUB_OAUTH_REDIRECT_URI` in .env exactly matches GitHub App settings
- No trailing slashes
- Protocol must match (http vs https)

### "Client Secret is invalid" Error

- Verify `GITHUB_CLIENT_SECRET` in `.env.local`
- If recently regenerated, make sure you copied the full secret
- Check for accidental spaces or line breaks

### "Permission denied" When Accessing Repositories

- Request additional scopes in GitHub App settings
- User may need to authorize app again after permission changes
- Check GitHub App installation has repo access selected

### Can't See My Repositories

- GitHub App installation may not include all repositories
- User needs to reinstall and grant access to specific repos
- Check GitHub App settings for "Repository access" configuration

---

## 📊 Monitoring & Debugging

### View GitHub App Activity

Go to https://github.com/settings/apps/the-devflow-bot and check:

- **Installations:** Who has installed your app
- **Recent deliveries:** Last webhook events (if enabled)
- **Authorization logs:** Who authorized your app

### Enable GitHub CLI Debug Logs

For local development, you can debug OAuth flow:

```bash
# Print detailed logs
DEBUG=* npm run dev
```

### View OAuth Token Permissions

After a user authorizes, their token is stored in your database. You can verify:

```bash
# Check MongoDB
use devflow
db.users.findOne({github_id: "12345"})
```

You'll see the stored access token and permissions.

---

## 🔄 Updating App Configuration

If you need to change the app settings:

1. **Before you change it:** Document the old value
2. **Make the change** on GitHub
3. **Update your code/docs** to match
4. **Restart applications** using new config
5. **Test thoroughly** (especially OAuth flow)

### Changes That Require User Re-authorization

- ❌ Adding new permission scopes
- ❌ Changing webhook secret

### Changes That Don't Require Re-authorization

- ✅ Updating redirect URI (if using same domain)
- ✅ Changing app name/description
- ✅ Modifying webhook events (if secret unchanged)

---

## 🎯 Next Steps

1. ✅ Copy credentials to `.env.local`
2. ✅ Update redirect URI in GitHub App settings
3. ✅ Configure required permissions
4. ✅ Test OAuth flow locally
5. ✅ Deploy to production with production secrets
6. ✅ Add webhook handling (optional)

---

## 📚 Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [OAuth Authorization for Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API Reference](https://docs.github.com/en/rest)
- [Webhooks Guide](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all credentials in `.env.local`
3. Review GitHub App activity logs
4. Check application error logs
5. Open an issue on GitHub with logs
