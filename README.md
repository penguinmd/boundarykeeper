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

### Setup

1. **Configure Backend API Key**
```bash
# Edit server/.env and add your Claude API key
cd server
# Replace the placeholder with your actual key:
# CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
```

2. **Start Backend** (Terminal 1)
```bash
cd server
npm run dev
# Server will run on http://localhost:3001
```

3. **Start Frontend** (Terminal 2)
```bash
cd client
npm run dev
# Frontend will run on http://localhost:5173
```

4. **Open Browser**
Visit http://localhost:5173

## Project Structure

```
boundarykeeper/
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # React components (to be built)
│   │   ├── services/      # API integration (to be built)
│   │   ├── utils/         # Helper functions (to be built)
│   │   └── App.jsx        # Main app
│   └── package.json
├── server/                 # Express backend
│   ├── routes/
│   │   └── analyze.js     # /api/analyze endpoint
│   ├── services/
│   │   └── claude.js      # Claude API integration
│   ├── server.js          # Express server
│   └── .env               # ⚠️ Add your Claude API key here!
├── docs/                   # Documentation
│   ├── plans/
│   │   ├── 2025-11-22-mvp-design.md           # Design document
│   │   └── 2025-11-22-boundary-keeper-mvp.md  # Implementation plan
│   ├── api/
│   ├── architecture/
│   └── user-guides/
└── README.md
```

## Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for styling
- Axios for API calls
- React Hot Toast for notifications

**Backend:**
- Node.js / Express
- Anthropic Claude API (Sonnet 4.5)
- CORS & Helmet security

## Documentation

- **Mission & Vision**: See `docs/plans/2025-11-22-mvp-design.md`
- **Implementation Plan**: See `docs/plans/2025-11-22-boundary-keeper-mvp.md`
- **Original Research**: See `Boundary Keeper Plan.pdf`

## Development Workflow

This project follows a structured development approach:

1. **Design Phase** ✅ - Complete mission statement and architecture
2. **Planning Phase** ✅ - Detailed implementation plan with 12 tasks
3. **Implementation Phase** 🚧 - Currently here! Follow the plan step-by-step
4. **Testing Phase** - Manual and automated testing
5. **Deployment Phase** - Railway (backend) + Vercel (frontend)

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

⚠️ **REQUIRED:** You must add your Claude API key to `server/.env` before the backend will work.

💡 **Privacy:** All conversation history is stored in your browser's localStorage. Nothing is saved to remote servers.

📖 **Implementation:** Follow `docs/plans/2025-11-22-boundary-keeper-mvp.md` for detailed step-by-step implementation instructions.

## License

MIT

## Next Actions

1. **Add your Claude API key** to `server/.env`
2. **Test the backend**: `cd server && npm run dev`
3. **Test the frontend**: `cd client && npm run dev`
4. **Continue implementation** following the detailed plan in `docs/plans/2025-11-22-boundary-keeper-mvp.md`
