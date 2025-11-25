# 🏔️ Boundary Keeper

Transform emotional messages into neutral, effective responses using AI-powered grey rock and yellow rock methodologies.

## Project Status: ✅ MVP COMPLETE AND FUNCTIONAL!

### ✅ All Core Features Implemented
- [x] Comprehensive design document and mission statement
- [x] Detailed 12-task implementation plan
- [x] Backend infrastructure (Express + Claude API)
- [x] Frontend infrastructure (React + Vite + Tailwind)
- [x] **TextInput component with validation and character counter**
- [x] **API integration with Claude**
- [x] **Emotional content analysis and highlighting**
- [x] **Grey rock and yellow rock version generation**
- [x] **Copy-to-clipboard functionality**
- [x] **localStorage conversation history**
- [x] **InfoTooltip with user education**
- [x] **Mobile-responsive design**
- [x] **Error handling and toast notifications**

### 🎯 Ready for Production!

The MVP is **fully functional** and ready to use. All planned features are implemented and working.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Setup (Vercel Deployment)

1. **Push to GitHub**
2. **Import to Vercel** at [vercel.com](https://vercel.com)
3. **Add Environment Variables** in Vercel dashboard:
   - `CLAUDE_API_KEY` - Your Anthropic API key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `GEMINI_API_KEY` - Your Google Gemini API key (optional)
4. **Deploy!**

Your app will be live at `https://your-project-name.vercel.app`

## Project Structure

```
boundarykeeper/
├── api/                    # Vercel serverless functions
│   ├── analyze.js         # POST /api/analyze endpoint
│   ├── models.js          # GET /api/models endpoint
│   └── services/          # Shared backend services
│       ├── providerManager.js
│       └── providers/     # LLM provider integrations
│           ├── baseProvider.js
│           ├── claudeProvider.js
│           ├── openaiProvider.js
│           └── geminiProvider.js
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API integration
│   │   ├── utils/         # Helper functions
│   │   └── App.jsx        # Main app
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for styling
- Axios for API calls
- React Hot Toast for notifications

**Backend:**
- Vercel Serverless Functions
- Multi-provider AI support:
  - Anthropic Claude (Sonnet 4.5, Haiku 4.5, Sonnet 4)
  - OpenAI GPT (GPT-5.1, GPT-4, GPT-4o-mini)
  - Google Gemini (2.5 Pro, 2.5 Flash)

## Documentation

- **Mission & Vision**: See `docs/plans/2025-11-22-mvp-design.md`
- **Implementation Plan**: See `docs/plans/2025-11-22-boundary-keeper-mvp.md`
- **Original Research**: See `Boundary Keeper Plan.pdf`

## Deployment

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variable: `CLAUDE_API_KEY`
4. Deploy!

Your app will be live at `https://your-project-name.vercel.app`

**Suggested project names**: grey-matter, rock-steady, neutral-ground, boundary-rock

## Development Workflow

This project follows a structured development approach:

1. **Design Phase** ✅ - Complete mission statement and architecture
2. **Planning Phase** ✅ - Detailed implementation plan with 12 tasks
3. **Implementation Phase** ✅ - MVP complete and functional!
4. **Testing Phase** ✅ - Manual testing complete
5. **Deployment Phase** 🚀 - Ready for Vercel deployment!

## Features (MVP Complete! ✅)

- ✅ Backend API with Claude integration
- ✅ Frontend infrastructure
- ✅ Real-time text analysis
- ✅ Emotional content highlighting
- ✅ Grey rock version generation
- ✅ Yellow rock version generation
- ✅ Copy-to-clipboard functionality
- ✅ Conversation history (localStorage)
- ✅ Mobile-responsive design
- ✅ Educational tooltips

## Important Notes

⚠️ **REQUIRED:** You must add your API keys to Vercel environment variables before the backend will work.

💡 **Privacy:** All conversation history is stored in your browser's localStorage. Nothing is saved to remote servers.

## License

MIT

## Next Actions

### For Production Deployment:
1. **Deploy to Vercel**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Add API keys** in Vercel environment variables
3. **Share your app** with the world!

## Architecture

**Production (Vercel)**:
- Frontend: Static React build served by Vercel CDN
- Backend: Serverless functions (`/api/analyze.js`, `/api/models.js`)
- Storage: localStorage (browser-only, for conversation history)
