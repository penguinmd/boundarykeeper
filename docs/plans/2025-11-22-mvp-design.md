# Boundary Keeper MVP Design
**Date:** 2025-11-22
**Status:** Approved
**Version:** 1.0

## Mission Statement

> Boundary Keeper empowers individuals navigating difficult relationships by providing immediate, AI-powered assistance to communicate with emotional clarity and confidence.
>
> We believe everyone deserves to protect their mental health while maintaining necessary communications. Our tool transforms emotionally charged messages into neutral, effective responses using proven grey rock and yellow rock methodologies.
>
> Starting with a simple, privacy-focused web application, we're building toward a comprehensive platform that combines real-time communication assistance, legal documentation, and emotional support for those dealing with high-conflict personalities.

### MVP Values
- **Privacy First**: Your conversations stay in your browser
- **Immediate Help**: No accounts, no barriers, just paste and get help
- **Education Through Use**: Learn grey rock principles by seeing them applied
- **Empowerment**: Give people tools to reclaim control of their communications

### MVP Vision

**What we're building now:** A web app where anyone can paste a stressful message, instantly see what makes it emotional, and get two versions they can use: grey rock (neutral) and yellow rock (politely neutral).

**Why it matters:** People in high-conflict situations need help *in the moment*. Not after therapy, not after researching techniques—right now, when they're staring at a provocative text and need to respond.

**How we'll grow:** This MVP validates the core value: AI-assisted grey rock communication actually helps. Once proven, we'll add the documentation, history tracking, templates, and professional features outlined in our research.

---

## Architecture Overview

### High-Level Structure

```
Frontend (React + Vite)          Backend (Express + Node.js)
┌─────────────────────┐         ┌──────────────────────┐
│  React UI           │         │  Express API         │
│  ├─ Input Form      │────────>│  └─ /api/analyze     │
│  ├─ Results Display │<────────│       └─> Claude API │
│  └─ History (localStorage)    └──────────────────────┘
└─────────────────────┘
```

### Project Structure

```
boundarykeeper/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API calls to backend
│   │   ├── utils/         # localStorage, helpers
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── routes/
│   │   └── analyze.js     # API endpoint
│   ├── services/
│   │   └── claude.js      # Claude API integration
│   ├── server.js
│   └── package.json
├── docs/                   # Project documentation
│   ├── plans/
│   ├── api/
│   ├── architecture/
│   ├── user-guides/
│   └── development/
└── README.md
```

### Communication Flow
- Frontend makes POST requests to `http://localhost:3001/api/analyze`
- Backend calls Claude API, returns structured response
- Frontend saves results to localStorage
- No database (yet) - everything ephemeral except browser storage

---

## Frontend Design

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool (faster than Create React App)
- **TailwindCSS** - Styling (utility-first, responsive)
- **Axios** - HTTP client for API calls
- **React-hot-toast** - Toast notifications
- **UUID** - Generate IDs for localStorage

### Components

#### 1. App.jsx
Root component, manages global state and routing (if needed later).

#### 2. TextInput.jsx
- Large textarea for pasting text
- Character count
- "Analyze" button (disabled when empty)
- Clear button
- Placeholder text with example

#### 3. AnalysisResults.jsx
- Three-column layout:
  - **Left**: Original text with emotional highlights
  - **Middle**: Grey rock version
  - **Right**: Yellow rock version
- Emotion summary banner at top
- Copy buttons for each version
- "Why did this change?" collapsible explanation

#### 4. EmotionalHighlighter.jsx
- Takes original text + array of emotional phrases
- Renders text with highlighted spans
- Tooltip on hover showing why it's flagged
- Color-coded by emotion type

#### 5. VersionCard.jsx
- Reusable component for grey/yellow rock versions
- Shows rewritten text
- Copy button with success feedback
- Optional explanation toggle
- Distinct styling for grey vs yellow rock

#### 6. ConversationHistory.jsx
- Sidebar or dropdown
- Lists recent analyses from localStorage
- Click to reload previous analysis
- Clear history button
- Shows timestamp and preview

#### 7. InfoTooltip.jsx
- Explains grey rock vs yellow rock difference
- Shows on first visit (localStorage flag)
- Can be toggled on/off
- Link to full explanation page

### Component Tree

```
App
├── Header
│   └── InfoTooltip
├── TextInput
├── AnalysisResults
│   ├── EmotionalSummary
│   ├── EmotionalHighlighter
│   ├── VersionCard (Grey Rock)
│   └── VersionCard (Yellow Rock)
└── ConversationHistory
```

### State Management

**Local Component State (useState):**
- Input text
- Loading state
- Analysis results
- Copy success feedback

**localStorage Structure:**
```json
{
  "conversations": [
    {
      "id": "uuid-here",
      "timestamp": "2025-11-22T10:30:00Z",
      "original": "User's original text",
      "emotions": {
        "summary": ["Defensive language", "Emotional intensity"],
        "highlights": [
          {
            "text": "can't believe",
            "reason": "Emotional intensifier",
            "start": 2,
            "end": 14
          }
        ]
      },
      "greyRock": {
        "text": "Noted.",
        "explanation": "Removed emotional language and defensive tone..."
      },
      "yellowRock": {
        "text": "Thank you for letting me know.",
        "explanation": "Added polite acknowledgment while maintaining neutrality..."
      }
    }
  ],
  "preferences": {
    "showTooltips": true,
    "theme": "light"
  }
}
```

---

## Backend Design

### Tech Stack
- **Node.js 18+** - Runtime
- **Express 4** - Web framework
- **@anthropic-ai/sdk** - Official Claude API client
- **dotenv** - Environment variables
- **cors** - Handle cross-origin requests
- **helmet** - Security headers

### API Endpoints

#### POST /api/analyze

**Request:**
```json
{
  "text": "I can't believe you're doing this again!",
  "includeExplanation": true
}
```

**Response:**
```json
{
  "original": "I can't believe you're doing this again!",
  "emotions": {
    "summary": ["Defensive language", "Emotional intensity", "Accusatory tone"],
    "highlights": [
      {
        "text": "can't believe",
        "reason": "Emotional intensifier expressing disbelief",
        "start": 2,
        "end": 14
      },
      {
        "text": "again",
        "reason": "Accusatory reference to past behavior",
        "start": 36,
        "end": 41
      }
    ]
  },
  "greyRock": {
    "text": "Noted.",
    "explanation": "Removed all emotional content, defensive language, and accusations. Reduced to minimal factual acknowledgment."
  },
  "yellowRock": {
    "text": "Thank you for letting me know.",
    "explanation": "Maintained emotional neutrality while adding polite acknowledgment. Suitable for court-reviewed communications."
  }
}
```

**Error Response:**
```json
{
  "error": true,
  "message": "Text is required and must be less than 5000 characters",
  "code": "INVALID_INPUT"
}
```

### Claude API Integration

**Prompt Strategy:**

The backend makes **one** API call to Claude with a carefully crafted prompt that returns all needed information in a single response.

**System Prompt:**
```
You are a communication expert specializing in grey rock and yellow rock methodologies for managing difficult conversations with high-conflict personalities.

Grey rock: Emotionally neutral, brief, factual only. No engagement with provocations.
Yellow rock: Grey rock + minimal politeness markers. Suitable for court-reviewed communications.

Your task:
1. Analyze the emotional content
2. Identify specific emotional triggers
3. Provide both grey rock and yellow rock rewrites
4. Explain what changed and why
```

**User Prompt:**
```
Analyze this message and provide a complete response:

"{user_text}"

Return valid JSON only (no markdown, no explanation outside JSON):
{
  "emotions": {
    "summary": ["list", "of", "emotion types"],
    "highlights": [
      {"text": "phrase", "reason": "why it's emotional", "start": 0, "end": 6}
    ]
  },
  "greyRock": {
    "text": "rewritten version",
    "explanation": "what changed"
  },
  "yellowRock": {
    "text": "rewritten version",
    "explanation": "what changed"
  }
}
```

### Error Handling

**Backend Error Scenarios:**

1. **Invalid/Empty Text**
   - Status: 400
   - Message: "Text is required"

2. **Text Too Long**
   - Status: 400
   - Message: "Text exceeds maximum length (5000 characters)"

3. **Claude API Failure**
   - Retry once with exponential backoff
   - Status: 503
   - Message: "Service temporarily unavailable. Please try again."

4. **API Key Invalid**
   - Status: 500
   - Message: "Configuration error"
   - Log critical error for developer

5. **Rate Limiting**
   - Status: 429
   - Message: "Too many requests. Please try again in a moment."

---

## Data Flow

### Complete User Journey

1. **User visits site**
   - App loads
   - Check localStorage for preferences
   - Show InfoTooltip if first visit

2. **User pastes text**
   - TextInput component updates
   - Character count updates
   - Analyze button enables

3. **User clicks "Analyze"**
   - Set loading state
   - Disable input/button
   - Call `analyzeText(text)` service

4. **Frontend service makes API call**
   - POST to `/api/analyze`
   - Include text in request body
   - Handle network errors

5. **Backend receives request**
   - Validate input (not empty, length check)
   - Call Claude API service
   - Parse JSON response from Claude
   - Return structured data

6. **Backend error handling**
   - If Claude fails: retry once
   - If still fails: return 503 error
   - Log errors for debugging

7. **Frontend receives response**
   - Parse JSON
   - Generate UUID for conversation
   - Add timestamp
   - Save to localStorage
   - Clear loading state
   - Render AnalysisResults

8. **User views results**
   - See highlighted emotional triggers
   - Read emotion summary
   - Compare grey vs yellow rock versions
   - Read explanations (optional)

9. **User copies version**
   - Click copy button
   - Text copied to clipboard
   - Show success toast
   - Track which version was copied (for future analytics)

10. **User can review history**
    - Click history button
    - See list of past analyses
    - Click to reload previous conversation

---

## Styling & UX

### Design System

**Color Palette:**
- **Primary**: Calm teal (#0D9488) - trustworthy, professional
- **Grey Rock Section**: Neutral greys (#6B7280, #F3F4F6)
- **Yellow Rock Section**: Warm beige/cream (#FEF3C7, #F59E0B)
- **Emotional Highlights**: Soft red/orange (#FCA5A5, #EF4444)
- **Success**: Soft green (#86EFAC, #10B981)
- **Background**: Clean white (#FFFFFF) or very light grey (#F9FAFB)

**Typography:**
- **Font**: Inter or system UI stack
- **Input/Results**: 16px base (readable when stressed)
- **Headings**: 24px, 20px, 18px
- **Generous line spacing**: 1.6 for readability

### Layout (Desktop)

```
┌──────────────────────────────────────────────────────┐
│  🏔️ Boundary Keeper              [?] What is this?  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Paste the message you need to respond to...    │ │
│  │                                                 │ │
│  │                                    250 chars    │ │
│  └─────────────────────────────────────────────────┘ │
│                [Analyze Message]   [Clear]            │
│                                                       │
├──────────────────────────────────────────────────────┤
│  ⚠️ Emotions detected:                               │
│  • Defensive language • Emotional intensity          │
│  • Accusatory tone                                   │
├──────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────────────┐│
│  │  Original   │  Grey Rock  │  Yellow Rock        ││
│  │             │             │                     ││
│  │  [text      │  [neutral   │  [polite neutral    ││
│  │   with      │   version]  │   version]          ││
│  │   emotional │             │                     ││
│  │   highlights│  📋 Copy    │  📋 Copy            ││
│  │  ]          │             │                     ││
│  │             │  ℹ️ Why?    │  ℹ️ Why?            ││
│  └─────────────┴─────────────┴─────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

Stack vertically:
```
┌──────────────────────┐
│  Boundary Keeper  [?]│
├──────────────────────┤
│  [Input text area]   │
│  [Analyze] [Clear]   │
├──────────────────────┤
│  ⚠️ Emotions:        │
│  • Defensive         │
│  • Emotional         │
├──────────────────────┤
│  Original Text:      │
│  [with highlights]   │
├──────────────────────┤
│  Grey Rock:          │
│  [neutral version]   │
│  📋 Copy  ℹ️ Why?   │
├──────────────────────┤
│  Yellow Rock:        │
│  [polite version]    │
│  📋 Copy  ℹ️ Why?   │
└──────────────────────┘
```

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators on all interactive elements

---

## Testing Strategy

### Frontend Tests (Vitest + React Testing Library)

**Unit Tests:**
```javascript
// TextInput.test.jsx
- Renders textarea and button
- Button disabled when text empty
- Character count updates correctly
- Clear button empties textarea

// VersionCard.test.jsx
- Renders text correctly
- Copy button copies to clipboard
- Shows success feedback after copy
- Explanation toggles open/closed

// EmotionalHighlighter.test.jsx
- Highlights correct text spans
- Shows tooltips on hover
- Renders with correct colors
```

**Integration Tests:**
```javascript
// App.test.jsx
- Full flow: paste → analyze → results
- localStorage saves correctly
- History loads previous conversations
- Error states display properly
```

### Backend Tests (Jest)

**Unit Tests:**
```javascript
// analyze.test.js
- Validates input correctly
- Returns 400 for empty text
- Returns 400 for text > 5000 chars
- Calls Claude service with correct params

// claude.service.test.js
- Formats prompts correctly
- Parses Claude response
- Handles API errors gracefully
- Retries on failure
```

**Integration Tests:**
```javascript
// API integration
- Full request/response cycle
- Mocked Claude responses
- Error handling works
- Returns correct JSON structure
```

### Manual Testing Checklist

**Functionality:**
- [ ] Paste text and get analysis
- [ ] Emotional highlights display correctly
- [ ] Both versions show side-by-side
- [ ] Copy buttons work and show feedback
- [ ] History saves to localStorage
- [ ] History can be cleared
- [ ] Previous conversations reload correctly
- [ ] Error messages display for failures

**Cross-Browser:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

**Responsive:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Edge Cases:**
- [ ] Very long text (near 5000 char limit)
- [ ] Empty text
- [ ] Special characters
- [ ] Network failure
- [ ] API timeout

---

## Deployment

### Frontend Deployment (Vercel)

**Setup:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure build settings:
   - Framework: Vite
   - Build command: `cd client && npm run build`
   - Output directory: `client/dist`
4. Set environment variables:
   - `VITE_API_URL`: Backend URL

**Auto-Deploy:**
- Push to `main` branch → automatic production deploy
- Pull requests → preview deployments

### Backend Deployment (Railway)

**Setup:**
1. Create Railway account
2. New project from GitHub
3. Configure:
   - Root directory: `server/`
   - Start command: `node server.js`
4. Environment variables:
   - `CLAUDE_API_KEY`: Your Anthropic API key
   - `PORT`: 3001 (Railway auto-assigns)
   - `NODE_ENV`: production
   - `ALLOWED_ORIGINS`: https://boundarykeeper.vercel.app

**Features:**
- Free tier: 500 hours/month
- Automatic HTTPS
- Environment variable management
- Logs and monitoring

### Environment Variables

**Backend (.env):**
```bash
CLAUDE_API_KEY=sk-ant-your-key-here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:3001
```

**Production:**
- Backend: `ALLOWED_ORIGINS=https://boundarykeeper.com`
- Frontend: `VITE_API_URL=https://api.boundarykeeper.com`

### Domain Setup

1. Purchase `boundarykeeper.com` from Namecheap
2. Point to Vercel (frontend):
   - A record: 76.76.21.21
   - CNAME: cname.vercel-dns.com
3. Point API subdomain to Railway:
   - CNAME `api.boundarykeeper.com` → Railway URL

---

## Success Metrics

### Technical Success
- [ ] App loads in < 2 seconds
- [ ] API responses in < 5 seconds (p95)
- [ ] Zero critical bugs in first 100 uses
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] 95%+ uptime (first month)

### User Success
- [ ] 10 people successfully use it
- [ ] Positive feedback on rewrite quality (>70%)
- [ ] Users report feeling "helped" or "less stressed"
- [ ] At least 3 users save to history (indicates repeat use)
- [ ] Someone shares it with a friend (organic growth)

### Learning Success
- [ ] **Validate**: Does AI grey rock rewriting actually work?
- [ ] **Validate**: Do people prefer grey vs yellow in different situations?
- [ ] **Validate**: Is emotional highlighting helpful or distracting?
- [ ] **Identify**: What features do users ask for first?
- [ ] **Learn**: What types of messages do people analyze most?

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [x] Initialize Git repository
- [x] Create documentation structure
- [ ] Set up React frontend (Vite + Tailwind)
- [ ] Set up Express backend
- [ ] Get Claude API key
- [ ] Test Claude API connection
- [ ] Create basic README

### Phase 2: Core Features (Week 2)
- [ ] Build TextInput component
- [ ] Build backend /api/analyze endpoint
- [ ] Integrate Claude API
- [ ] Build AnalysisResults display
- [ ] Implement emotional highlighting
- [ ] Add three-column layout

### Phase 3: Polish & Storage (Week 3)
- [ ] Add copy-to-clipboard functionality
- [ ] Implement localStorage for history
- [ ] Build ConversationHistory component
- [ ] Error handling (frontend + backend)
- [ ] InfoTooltip component
- [ ] Mobile responsive design
- [ ] Loading states and feedback

### Phase 4: Testing & Launch (Week 4)
- [ ] Write unit tests
- [ ] Manual testing checklist
- [ ] Fix bugs
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Set up custom domain
- [ ] Beta test with 5-10 people
- [ ] Collect feedback
- [ ] Iterate based on feedback

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- User accounts and cloud storage
- Template library for common scenarios
- Advanced history search and filtering
- Export conversations to PDF
- Custom tone preferences

### Phase 3 Features
- Mobile apps (iOS/Android)
- Browser extension
- Real-time collaboration with therapists
- Pattern recognition over time
- Court-admissible documentation

### Long-term Vision
See `docs/roadmap.md` and the comprehensive research document for full feature set including co-parenting tools, professional partnerships, and advanced AI capabilities.

---

## Open Questions

- [ ] Should we add usage analytics (privacy-preserving)?
- [ ] Rate limiting strategy for shared API key?
- [ ] Maximum conversation history to store in localStorage?
- [ ] Should we add example/demo without requiring paste?
- [ ] Dark mode support in MVP?

---

## References

- Research Document: `Boundary Keeper Plan.pdf`
- Claude API Docs: https://docs.anthropic.com/
- Grey Rock Method: Multiple psychology sources
- Yellow Rock Method: Co-parenting communication technique

---

**Document Status:** ✅ Ready for Implementation
**Next Step:** Create detailed implementation plan
**Owner:** Development Team
**Last Updated:** 2025-11-22
