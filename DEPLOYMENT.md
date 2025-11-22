# Deployment Guide

## Vercel Deployment (Recommended)

Boundary Keeper is configured for seamless deployment to Vercel with serverless functions.

### Prerequisites

1. GitHub account with the boundarykeeper repository
2. Vercel account (free tier works great)
3. Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Quick Deploy to Vercel

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `boundarykeeper` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave as default)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install --prefix client && npm install @anthropic-ai/sdk`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add: `CLAUDE_API_KEY` = `your-api-key-here`
   - Click "Deploy"

5. **Choose Your Domain Name**
   - After deployment, go to Settings → Domains
   - Vercel provides: `your-project-name.vercel.app`
   - Suggested names:
     - `grey-matter` - Clever play on grey rock + brain
     - `rock-steady` - Stable, reliable boundaries
     - `neutral-ground` - Safe, neutral communication
     - `boundary-rock` - Direct and clear
     - `stone-response` - Cool, calm responses

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd /path/to/boundarykeeper

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: your-chosen-name
# - Directory: ./ (press enter)
# - Override settings? Yes
#   - Build Command: cd client && npm install && npm run build
#   - Output Directory: client/dist
#   - Install Command: npm install --prefix client && npm install @anthropic-ai/sdk

# Add environment variable
vercel env add CLAUDE_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

### Project Structure (Vercel)

```
boundarykeeper/
├── api/
│   └── analyze.js          # Serverless function for Claude API
├── client/
│   ├── dist/               # Built frontend (generated)
│   ├── src/                # React source code
│   └── package.json
├── vercel.json             # Vercel configuration
└── package.json            # Root package.json for API dependencies
```

### How It Works

1. **Frontend**: Vite builds React app to `client/dist/`
2. **Backend**: Vercel automatically deploys `api/analyze.js` as serverless function
3. **API Calls**: Frontend calls `/api/analyze` (relative path)
4. **Environment**: `CLAUDE_API_KEY` loaded from Vercel environment variables

### Environment Variables

Only one environment variable is needed:

- `CLAUDE_API_KEY` - Your Anthropic API key

Set in Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add `CLAUDE_API_KEY`
3. Available for: Production, Preview, Development

### Suggested Project Names

When deploying to Vercel, consider these creative names:

- **grey-matter** - Smart play on grey rock methodology + intelligence
- **rock-steady** - Emphasizes stable, reliable boundaries
- **neutral-ground** - Safe space for neutral communication
- **boundary-rock** - Direct and descriptive
- **stone-response** - Cool, calm, collected
- **solid-ground** - Firm boundaries
- **grey-zone** - Neutral territory
- **rock-method** - Methodology-focused

### Testing Your Deployment

After deployment:

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try analyzing some text
3. Check Vercel logs if issues occur:
   - Dashboard → Your Project → Deployments → Click deployment → Functions tab

### Monitoring

Vercel provides automatic monitoring:
- **Analytics**: Dashboard → Your Project → Analytics
- **Logs**: Dashboard → Your Project → Deployments → Functions
- **Performance**: Real User Monitoring (RUM) included

### Costs

- **Vercel Free Tier**:
  - 100GB bandwidth/month
  - 100GB-hrs serverless function execution
  - Perfect for personal use and MVPs

- **Claude API**:
  - Pay per use based on Anthropic pricing
  - Approximately $3 per million input tokens
  - Approximately $15 per million output tokens

### Local Development

```bash
# Install dependencies
cd client && npm install
cd .. && npm install

# Run development server
npm run dev

# Frontend runs on http://localhost:5176
# API calls go to local Express server on :3002 (if running)
# Or use Vercel dev for testing serverless functions:
vercel dev
```

### Troubleshooting

**Build fails:**
- Check that `@anthropic-ai/sdk` is in root `package.json`
- Verify `vercel.json` build commands are correct

**API returns 503:**
- Verify `CLAUDE_API_KEY` environment variable is set
- Check Vercel function logs for specific error

**CORS errors:**
- Should not occur (CORS handled in `api/analyze.js`)
- If issues persist, check `vercel.json` headers configuration

**Frontend can't reach API:**
- Verify `client/src/services/api.js` uses relative path in production
- Check Network tab in browser DevTools

### Alternative Deployment Options

#### Railway (Backend) + Vercel (Frontend)

If you prefer keeping the Express server:

1. Deploy `server/` folder to Railway
2. Deploy `client/` to Vercel
3. Set `VITE_API_URL` in Vercel to Railway backend URL

#### Self-Hosted

1. Build frontend: `cd client && npm run build`
2. Serve `client/dist` with any static file server
3. Run Express server: `cd server && npm start`
4. Set `VITE_API_URL` environment variable

---

## Summary

For the simplest deployment experience:
1. Push code to GitHub
2. Import to Vercel
3. Add `CLAUDE_API_KEY` environment variable
4. Choose a creative domain name
5. Deploy and share!

Your Boundary Keeper app will be live at `https://your-chosen-name.vercel.app`
