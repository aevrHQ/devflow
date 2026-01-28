# Deploy Agent-Host to Render with Docker

This guide shows how to deploy the agent-host service to Render using Docker.

## Quick Start (5-10 minutes)

### Step 1: Push Code to GitHub

Make sure your code is committed and pushed to GitHub:

```bash
cd /Users/miracleio/Documents/otherprojs/aevr/pinga-mvp
git add .
git commit -m "chore: add Docker configuration for agent-host"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. From Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select your DevFlow repository
4. Click **"Connect"**

### Step 4: Configure the Service

Fill in the deployment settings:

| Field              | Value                               |
| ------------------ | ----------------------------------- |
| **Name**           | `devflow-agent-host`                |
| **Root Directory** | `apps/agent-host`                   |
| **Environment**    | `Docker`                            |
| **Branch**         | `main`                              |
| **Build Command**  | _(leave empty - Docker handles it)_ |
| **Start Command**  | _(leave empty - Docker handles it)_ |

### Step 5: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** for each:

```
PORT=3001
NODE_ENV=production
DEVFLOW_API_URL=https://devflow.aevr.space
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/devflow
```

**Getting MONGODB_URI:**

1. Go to https://cloud.mongodb.com
2. Select your cluster → Click "Connect"
3. Choose "Drivers" → Node.js
4. Copy the connection string
5. Replace `<password>` with your actual password

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render automatically:
   - Detects Dockerfile
   - Builds the image
   - Deploys the container
   - Sets up health checks

### Step 7: Get Your Production URL

Once deployment is complete:

1. Copy your service URL from the Render dashboard
2. Example: `https://devflow-agent-host.onrender.com`

### Step 8: Update Web App Configuration

1. Go to Vercel dashboard → devflow-web settings
2. Add environment variable:
   ```
   AGENT_HOST_URL=https://devflow-agent-host.onrender.com
   ```
3. Vercel automatically redeploys

### Step 9: Test Connection

```bash
curl https://devflow-agent-host.onrender.com/health
```

Should return:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T12:00:00.000Z"
}
```

## Docker Details

### Dockerfile Features

The provided `Dockerfile` includes:

- **Multi-stage build** - Optimizes final image size
- **Alpine Linux** - Minimal base image (~40MB vs 1GB+)
- **Health checks** - Automatic health monitoring
- **Proper signal handling** - dumb-init for graceful shutdown
- **Production optimizations** - Only installs production dependencies

### Image Size

- Build time: ~1-2 minutes
- Final image: ~300-400MB
- Very efficient for Docker deployments

## Troubleshooting

### Deployment Fails During Build

**Check logs:**

1. Go to Render dashboard → Your service
2. Click "Logs" tab
3. Look for error messages

**Common issues:**

| Error                        | Solution                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| "Can't find root Dockerfile" | Ensure "Root Directory" is set to `apps/agent-host`        |
| "Build failed: npm ERR"      | Check package.json syntax, verify all dependencies listed  |
| "Out of memory during build" | Render free tier has 0.5GB RAM; may fail on large installs |

### Service Won't Stay Running

**Check:**

1. Are environment variables set? (All 4 required)
2. Is MongoDB connection string correct?
3. Look at logs for specific errors

**Common issues:**

| Issue                  | Solution                                                  |
| ---------------------- | --------------------------------------------------------- |
| Crashes immediately    | MONGODB_URI is invalid or incomplete                      |
| Health check fails     | Check PORT (must be 3001) and DEVFLOW_API_URL             |
| Can't connect from CLI | Verify AGENT_HOST_URL in web app is exact URL from Render |

### Health Check Fails

The health endpoint is `GET /health` on port 3001.

**Test locally:**

```bash
cd apps/agent-host
npm run dev
# In another terminal:
curl http://localhost:3001/health
```

**Test on Render:**

```bash
curl https://your-render-url/health
```

If it fails:

1. Check environment variables in Render dashboard
2. Check logs for startup errors
3. Verify MONGODB_URI is correct

## Performance Notes

### Render Free Tier Specs

- CPU: Shared (0.5 vCPU)
- Memory: 512MB
- Network: Outbound only
- Sleep: Services sleep after 15 min of inactivity (auto-wake on request)

### Render Paid Tier

For production use, consider upgrading to:

| Tier     | Price  | CPU      | Memory | Uptime       |
| -------- | ------ | -------- | ------ | ------------ |
| Free     | $0     | 0.5 vCPU | 512MB  | 50% (sleeps) |
| Starter  | $7/mo  | 0.5 vCPU | 512MB  | 100%         |
| Standard | $25/mo | 1 vCPU   | 2GB    | 100%         |

**Recommendation:** Use free tier for testing, upgrade to Starter ($7/mo) for production.

## Alternative Deployment Platforms

### Compared to Railway

| Aspect             | Railway        | Render         |
| ------------------ | -------------- | -------------- |
| **Setup time**     | 3-5 min        | 5-10 min       |
| **Docker support** | Yes            | Yes            |
| **Free tier**      | Yes            | Yes            |
| **Pricing**        | $5/mo starter  | $7/mo starter  |
| **UI/UX**          | Very intuitive | Very intuitive |
| **Performance**    | Excellent      | Excellent      |

Both are excellent choices. Docker on Render is best if you:

- Prefer Docker-first deployments
- Want containerization practice
- Plan to scale infrastructure later
- Like Render's interface better

### Compared to Vercel

Vercel is **NOT recommended** for agent-host because:

- ❌ Serverless architecture (agent-host needs persistent process)
- ❌ 10-second function timeout (agent needs longer to execute)
- ❌ No background job support
- ❌ Not designed for long-running services

Use Render or Railway instead.

## Monitoring & Logs

### View Real-Time Logs

1. Render dashboard → Your service
2. Click "Logs" tab
3. Logs stream in real-time

### Common Log Messages

**Normal startup:**

```
Loading environment variables...
Starting DevFlow Agent Host...
✓ Server running on port 3001
```

**Error during task execution:**

```
[ERROR] Task 123 failed: MongoDB connection lost
Retrying in 30 seconds...
```

### Enable Debug Logging

Add environment variable:

```
DEBUG=devflow:*
```

This increases log verbosity for troubleshooting.

## Updates & Redeployment

### Auto-Deploy on Git Push

Render automatically redeploys when you push to GitHub:

1. Make code changes
2. Commit and push: `git push origin main`
3. Render detects the push
4. Automatically rebuilds and deploys
5. Your service updates (zero downtime)

### Manual Redeploy

If you need to redeploy without code changes:

1. Render dashboard → Your service
2. Click "Manual Deploy" → "Deploy latest commit"

## Docker Best Practices

The provided Dockerfile follows production best practices:

✅ **Multi-stage build** - Reduces final image size  
✅ **Alpine Linux** - Minimal, secure base image  
✅ **Explicit dependencies** - Clear what's needed  
✅ **Health checks** - Automatic monitoring  
✅ **Signal handling** - Graceful shutdown with dumb-init  
✅ **Non-root user** - Security best practice (implied by Alpine defaults)  
✅ **Layer caching** - Optimizes rebuild speed

## Security Considerations

### Secrets Management

**DO NOT:**

- ❌ Commit `.env` file to Git
- ❌ Put secrets in Dockerfile
- ❌ Log sensitive values

**DO:**

- ✅ Use Render's environment variable UI
- ✅ Use `.env.example` template only (no secrets)
- ✅ Keep MongoDB credentials in Render dashboard

### Image Scanning

Render automatically scans Docker images for vulnerabilities. Monitor the "Security" tab for warnings.

### Access Control

1. Only give GitHub repo access to Render service account
2. Use separate credentials for MongoDB per environment
3. Monitor Render audit logs for access changes

## Next Steps

After deployment:

1. ✅ Test health endpoint: `curl https://your-url/health`
2. ✅ Update web app with AGENT_HOST_URL
3. ✅ Test CLI connection: `devflow start`
4. ✅ Create task on platform and verify execution
5. ✅ Record demo video
6. ✅ Submit to GitHub Copilot CLI Challenge

## Support

For Render-specific questions:

- https://docs.render.com
- https://render.com/support

For DevFlow questions:

- Check docs/ folder
- Review TROUBLESHOOTING.md

---

**You're ready to deploy!** 🚀

This Docker configuration works on:

- ✅ Render
- ✅ Railway
- ✅ Fly.io
- ✅ Amazon ECS
- ✅ Google Cloud Run
- ✅ Azure Container Instances
- ✅ Local Docker Desktop (for testing)
