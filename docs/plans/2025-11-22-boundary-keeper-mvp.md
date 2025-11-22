# Boundary Keeper MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that analyzes emotional content in text and provides grey rock + yellow rock rewrites using Claude API.

**Architecture:** React frontend (Vite) communicates with Express backend, which calls Claude API. Results saved to browser localStorage. No database, no user accounts.

**Tech Stack:** React 18, Vite, TailwindCSS, Express 4, Anthropic Claude API, Axios

---

## Task 1: Backend Setup and Claude API Integration

**Files:**
- Create: `server/package.json`
- Create: `server/server.js`
- Create: `server/.env.example`
- Create: `server/.env`
- Create: `server/.gitignore`
- Create: `server/services/claude.js`
- Create: `server/routes/analyze.js`

**Step 1: Initialize backend**

```bash
mkdir server
cd server
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install express cors dotenv helmet @anthropic-ai/sdk
npm install --save-dev nodemon jest
```

**Step 3: Create .gitignore**

Create `server/.gitignore`:
```
node_modules/
.env
*.log
```

**Step 4: Create .env.example**

Create `server/.env.example`:
```
CLAUDE_API_KEY=sk-ant-your-key-here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Step 5: Create .env file**

Create `server/.env`:
```
CLAUDE_API_KEY=your-actual-claude-api-key
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Step 6: Create basic server**

Create `server/server.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const analyzeRoute = require('./routes/analyze');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173'
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', analyzeRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 7: Create Claude service**

Create `server/services/claude.js`:
```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are a communication expert specializing in grey rock and yellow rock methodologies for managing difficult conversations with high-conflict personalities.

Grey rock: Emotionally neutral, brief, factual only. No engagement with provocations.
Yellow rock: Grey rock + minimal politeness markers. Suitable for court-reviewed communications.

Your task:
1. Analyze the emotional content
2. Identify specific emotional triggers and their locations in the text
3. Provide both grey rock and yellow rock rewrites
4. Explain what changed and why`;

async function analyzeText(text) {
  const userPrompt = `Analyze this message and provide a complete response:

"${text}"

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "emotions": {
    "summary": ["list", "of", "emotion", "types"],
    "highlights": [
      {"text": "exact phrase from input", "reason": "why it's emotional", "start": 0, "end": 6}
    ]
  },
  "greyRock": {
    "text": "rewritten version using grey rock method",
    "explanation": "brief explanation of what changed"
  },
  "yellowRock": {
    "text": "rewritten version using yellow rock method",
    "explanation": "brief explanation of what changed"
  }
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

module.exports = { analyzeText };
```

**Step 8: Create analyze route**

Create `server/routes/analyze.js`:
```javascript
const express = require('express');
const { analyzeText } = require('../services/claude');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: true,
        message: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Text cannot be empty',
        code: 'EMPTY_TEXT'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: true,
        message: 'Text exceeds maximum length (5000 characters)',
        code: 'TEXT_TOO_LONG'
      });
    }

    // Call Claude API
    const result = await analyzeText(text);

    // Return result with original text
    res.json({
      original: text,
      ...result
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);

    if (error.status === 429) {
      return res.status(429).json({
        error: true,
        message: 'Too many requests. Please try again in a moment.',
        code: 'RATE_LIMIT'
      });
    }

    res.status(503).json({
      error: true,
      message: 'Service temporarily unavailable. Please try again.',
      code: 'SERVICE_ERROR'
    });
  }
});

module.exports = router;
```

**Step 9: Update package.json scripts**

Modify `server/package.json` to add scripts:
```json
{
  "name": "boundary-keeper-server",
  "version": "1.0.0",
  "description": "Backend API for Boundary Keeper",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "keywords": ["grey-rock", "communication", "api"],
  "author": "",
  "license": "MIT"
}
```

**Step 10: Test backend manually**

```bash
cd server
npm run dev
```

Expected: Server starts on port 3001

Test with curl:
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"I cannot believe you did this again!"}'
```

Expected: JSON response with emotions, greyRock, yellowRock

**Step 11: Commit backend**

```bash
git add server/
git commit -m "feat: add Express backend with Claude API integration

- Set up Express server with CORS and security middleware
- Implement Claude API service for text analysis
- Create /api/analyze endpoint with validation
- Add grey rock and yellow rock rewriting
- Include error handling and rate limiting"
```

---

## Task 2: Frontend Setup

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/index.css`
- Create: `client/.env`
- Create: `client/.gitignore`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`

**Step 1: Create client directory and initialize**

```bash
npm create vite@latest client -- --template react
cd client
```

**Step 2: Install dependencies**

```bash
npm install
npm install axios react-hot-toast uuid
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

Create `client/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        greyRock: '#6B7280',
        yellowRock: '#F59E0B',
        highlight: '#EF4444',
        success: '#10B981',
      },
    },
  },
  plugins: [],
}
```

**Step 4: Create .env file**

Create `client/.env`:
```
VITE_API_URL=http://localhost:3001
```

**Step 5: Create .gitignore**

Create `client/.gitignore`:
```
# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Environment
.env.local
.env.*.local

# IDE
.vscode/*
.idea/
*.swp
*.swo
```

**Step 6: Update index.css with Tailwind**

Create `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 font-sans;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}
```

**Step 7: Create basic App.jsx**

Create `client/src/App.jsx`:
```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏔️ Boundary Keeper
          </h1>
          <p className="text-gray-600 mt-1">
            Transform emotional messages into neutral, effective responses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <p className="text-gray-600">Frontend setup complete!</p>
        </div>
      </main>
    </div>
  );
}

export default App;
```

**Step 8: Update main.jsx**

Create `client/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 9: Update vite.config.js**

Create `client/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

**Step 10: Test frontend**

```bash
cd client
npm run dev
```

Expected: Dev server starts on http://localhost:5173
Visit in browser: Should see "Boundary Keeper" header

**Step 11: Commit frontend setup**

```bash
git add client/
git commit -m "feat: initialize React frontend with Vite and Tailwind

- Set up Vite + React project structure
- Configure Tailwind CSS with custom theme
- Create basic App layout with header
- Add toast notifications support"
```

---

## Task 3: API Service and TextInput Component

**Files:**
- Create: `client/src/services/api.js`
- Create: `client/src/components/TextInput.jsx`

**Step 1: Create API service**

Create `client/src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

export async function analyzeText(text) {
  try {
    const response = await api.post('/api/analyze', { text });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Analysis failed');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
```

**Step 2: Create TextInput component**

Create `client/src/components/TextInput.jsx`:
```jsx
import { useState } from 'react';

export default function TextInput({ onAnalyze, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const charCount = text.length;
  const maxChars = 5000;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-2">
          Your Message
        </label>

        <textarea
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the message you need to respond to..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base"
          disabled={loading}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!text.trim() || loading || isOverLimit}
              className="btn-primary"
            >
              {loading ? 'Analyzing...' : 'Analyze Message'}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!text || loading}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>

          <span className={`text-sm ${
            isOverLimit ? 'text-red-600 font-semibold' :
            isNearLimit ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </form>
    </div>
  );
}
```

**Step 3: Update App.jsx to use TextInput**

Modify `client/src/App.jsx`:
```jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import TextInput from './components/TextInput';

function App() {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = (text) => {
    console.log('Analyzing:', text);
    setLoading(true);
    // Will implement API call next
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏔️ Boundary Keeper
          </h1>
          <p className="text-gray-600 mt-1">
            Transform emotional messages into neutral, effective responses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <TextInput onAnalyze={handleAnalyze} loading={loading} />
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Test TextInput**

```bash
cd client
npm run dev
```

Expected:
- Large textarea appears
- Character count updates as you type
- Analyze button disabled when empty
- Clear button works

**Step 5: Commit TextInput component**

```bash
git add client/src/
git commit -m "feat: add TextInput component with validation

- Create API service for backend communication
- Build TextInput component with character counter
- Add form validation and loading states
- Implement clear functionality"
```

---

## Task 4: Analysis Results Display

**Files:**
- Create: `client/src/components/AnalysisResults.jsx`
- Create: `client/src/components/EmotionalSummary.jsx`
- Modify: `client/src/App.jsx`

**Step 1: Create EmotionalSummary component**

Create `client/src/components/EmotionalSummary.jsx`:
```jsx
export default function EmotionalSummary({ emotions }) {
  if (!emotions || !emotions.summary || emotions.summary.length === 0) {
    return null;
  }

  return (
    <div className="card bg-red-50 border-red-200">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Emotions Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {emotions.summary.map((emotion, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create AnalysisResults component**

Create `client/src/components/AnalysisResults.jsx`:
```jsx
import EmotionalSummary from './EmotionalSummary';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 mt-8">
      <EmotionalSummary emotions={result.emotions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Original Text */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">
            Original Message
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {result.original}
          </p>
        </div>

        {/* Grey Rock */}
        <div className="card bg-gray-50 border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-3">
            Grey Rock Version
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {result.greyRock?.text}
          </p>
          <button className="btn-secondary w-full">
            📋 Copy
          </button>
        </div>

        {/* Yellow Rock */}
        <div className="card bg-yellow-50 border-yellow-300">
          <h3 className="font-semibold text-gray-900 mb-3">
            Yellow Rock Version
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {result.yellowRock?.text}
          </p>
          <button className="btn-secondary w-full">
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Update App.jsx with API integration**

Modify `client/src/App.jsx`:
```jsx
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TextInput from './components/TextInput';
import AnalysisResults from './components/AnalysisResults';
import { analyzeText } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeText(text);
      setResult(data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏔️ Boundary Keeper
          </h1>
          <p className="text-gray-600 mt-1">
            Transform emotional messages into neutral, effective responses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <TextInput onAnalyze={handleAnalyze} loading={loading} />
        <AnalysisResults result={result} />
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Test complete flow**

Ensure both backend and frontend are running:
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Test: Paste emotional text, click Analyze, see results

**Step 5: Commit analysis results**

```bash
git add client/src/
git commit -m "feat: add analysis results display

- Create EmotionalSummary component
- Build AnalysisResults with three-column layout
- Integrate API service with App
- Add error handling and toast notifications"
```

---

## Task 5: Emotional Highlighting

**Files:**
- Create: `client/src/components/EmotionalHighlighter.jsx`
- Modify: `client/src/components/AnalysisResults.jsx`

**Step 1: Create EmotionalHighlighter component**

Create `client/src/components/EmotionalHighlighter.jsx`:
```jsx
export default function EmotionalHighlighter({ text, highlights }) {
  if (!highlights || highlights.length === 0) {
    return <p className="text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  // Build array of text segments
  const segments = [];
  let currentIndex = 0;

  sortedHighlights.forEach((highlight, idx) => {
    // Add text before highlight
    if (currentIndex < highlight.start) {
      segments.push({
        type: 'text',
        content: text.slice(currentIndex, highlight.start),
        key: `text-${idx}`
      });
    }

    // Add highlighted text
    segments.push({
      type: 'highlight',
      content: text.slice(highlight.start, highlight.end),
      reason: highlight.reason,
      key: `highlight-${idx}`
    });

    currentIndex = highlight.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(currentIndex),
      key: 'text-final'
    });
  }

  return (
    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
      {segments.map(segment => {
        if (segment.type === 'highlight') {
          return (
            <span
              key={segment.key}
              className="bg-red-100 text-red-900 px-1 rounded cursor-help border-b-2 border-red-300"
              title={segment.reason}
            >
              {segment.content}
            </span>
          );
        }
        return <span key={segment.key}>{segment.content}</span>;
      })}
    </p>
  );
}
```

**Step 2: Update AnalysisResults to use highlighter**

Modify `client/src/components/AnalysisResults.jsx`:
```jsx
import EmotionalSummary from './EmotionalSummary';
import EmotionalHighlighter from './EmotionalHighlighter';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 mt-8">
      <EmotionalSummary emotions={result.emotions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Original Text with Highlights */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">
            Original Message
          </h3>
          <EmotionalHighlighter
            text={result.original}
            highlights={result.emotions?.highlights}
          />
          <p className="text-xs text-gray-500 mt-3 italic">
            Hover over highlighted text to see why it's flagged
          </p>
        </div>

        {/* Grey Rock */}
        <div className="card bg-gray-50 border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-3">
            Grey Rock Version
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {result.greyRock?.text}
          </p>
          <button className="btn-secondary w-full">
            📋 Copy
          </button>
        </div>

        {/* Yellow Rock */}
        <div className="card bg-yellow-50 border-yellow-300">
          <h3 className="font-semibold text-gray-900 mb-3">
            Yellow Rock Version
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {result.yellowRock?.text}
          </p>
          <button className="btn-secondary w-full">
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Test highlighting**

Test with: "I can't believe you're doing this again!"

Expected: "can't believe" and "again" highlighted with hover tooltips

**Step 4: Commit highlighting**

```bash
git add client/src/components/
git commit -m "feat: add emotional highlighting in original text

- Create EmotionalHighlighter component
- Parse highlight positions and render spans
- Add hover tooltips explaining why text is flagged
- Update AnalysisResults to use highlighter"
```

---

## Task 6: Copy Functionality and Version Cards

**Files:**
- Create: `client/src/components/VersionCard.jsx`
- Create: `client/src/utils/clipboard.js`
- Modify: `client/src/components/AnalysisResults.jsx`

**Step 1: Create clipboard utility**

Create `client/src/utils/clipboard.js`:
```javascript
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}
```

**Step 2: Create VersionCard component**

Create `client/src/components/VersionCard.jsx`:
```jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/clipboard';

export default function VersionCard({
  title,
  text,
  explanation,
  variant = 'grey'
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${title} copied to clipboard!`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const bgColor = variant === 'grey' ? 'bg-gray-50' : 'bg-yellow-50';
  const borderColor = variant === 'grey' ? 'border-gray-300' : 'border-yellow-300';

  return (
    <div className={`card ${bgColor} ${borderColor}`}>
      <h3 className="font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-gray-700 whitespace-pre-wrap mb-4 min-h-[60px]">
        {text}
      </p>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="btn-secondary w-full"
        >
          📋 Copy
        </button>

        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-sm text-gray-600 hover:text-gray-900 w-full text-left flex items-center gap-1"
          >
            <span>{showExplanation ? '▼' : '▶'}</span>
            Why did this change?
          </button>
        )}

        {showExplanation && explanation && (
          <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Update AnalysisResults to use VersionCard**

Modify `client/src/components/AnalysisResults.jsx`:
```jsx
import EmotionalSummary from './EmotionalSummary';
import EmotionalHighlighter from './EmotionalHighlighter';
import VersionCard from './VersionCard';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 mt-8">
      <EmotionalSummary emotions={result.emotions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Original Text with Highlights */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">
            Original Message
          </h3>
          <EmotionalHighlighter
            text={result.original}
            highlights={result.emotions?.highlights}
          />
          <p className="text-xs text-gray-500 mt-3 italic">
            Hover over highlighted text to see why it's flagged
          </p>
        </div>

        {/* Grey Rock */}
        <VersionCard
          title="Grey Rock Version"
          text={result.greyRock?.text}
          explanation={result.greyRock?.explanation}
          variant="grey"
        />

        {/* Yellow Rock */}
        <VersionCard
          title="Yellow Rock Version"
          text={result.yellowRock?.text}
          explanation={result.yellowRock?.explanation}
          variant="yellow"
        />
      </div>
    </div>
  );
}
```

**Step 4: Test copy functionality**

Test: Click copy button, verify text copied to clipboard and toast appears

**Step 5: Commit copy functionality**

```bash
git add client/src/
git commit -m "feat: add copy functionality and VersionCard component

- Create clipboard utility with fallback support
- Build VersionCard with copy and explanation toggle
- Add success/error toast notifications for copy
- Update AnalysisResults to use VersionCard"
```

---

## Task 7: LocalStorage and History

**Files:**
- Create: `client/src/utils/storage.js`
- Create: `client/src/components/ConversationHistory.jsx`
- Modify: `client/src/App.jsx`

**Step 1: Create storage utility**

Create `client/src/utils/storage.js`:
```javascript
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'boundarykeeper_conversations';
const MAX_CONVERSATIONS = 50;

export function saveConversation(result) {
  try {
    const conversations = getConversations();

    const conversation = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...result
    };

    // Add to beginning of array
    conversations.unshift(conversation);

    // Keep only MAX_CONVERSATIONS
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    return conversation;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return null;
  }
}

export function getConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function clearConversations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear conversations:', error);
    return false;
  }
}

export function getConversationById(id) {
  const conversations = getConversations();
  return conversations.find(c => c.id === id);
}
```

**Step 2: Create ConversationHistory component**

Create `client/src/components/ConversationHistory.jsx`:
```jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getConversations, clearConversations } from '../utils/storage';

export default function ConversationHistory({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const data = getConversations();
    setConversations(data);
  };

  const handleClear = () => {
    if (window.confirm('Clear all conversation history?')) {
      const success = clearConversations();
      if (success) {
        setConversations([]);
        toast.success('History cleared');
      } else {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleSelect = (conversation) => {
    onSelectConversation(conversation);
    setIsOpen(false);
    toast.success('Conversation loaded');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncate = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
      >
        📜 History ({conversations.length})
      </button>

      {isOpen && (
        <div className="card mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Recent Conversations
            </h3>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => handleSelect(convo)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {truncate(convo.original)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(convo.timestamp)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Update App.jsx to use history**

Modify `client/src/App.jsx`:
```jsx
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TextInput from './components/TextInput';
import AnalysisResults from './components/AnalysisResults';
import ConversationHistory from './components/ConversationHistory';
import { analyzeText } from './services/api';
import { saveConversation } from './utils/storage';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeText(text);
      setResult(data);
      saveConversation(data);
      setHistoryKey(prev => prev + 1); // Trigger history reload
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setResult(conversation);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏔️ Boundary Keeper
          </h1>
          <p className="text-gray-600 mt-1">
            Transform emotional messages into neutral, effective responses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <ConversationHistory
          key={historyKey}
          onSelectConversation={handleSelectConversation}
        />
        <TextInput onAnalyze={handleAnalyze} loading={loading} />
        <AnalysisResults result={result} />
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Test history**

Test:
1. Analyze several messages
2. Check history appears
3. Click history item to reload
4. Clear history

**Step 5: Commit history feature**

```bash
git add client/src/
git commit -m "feat: add conversation history with localStorage

- Create storage utility for saving/loading conversations
- Build ConversationHistory component with list view
- Add clear history functionality
- Integrate history with App to reload conversations"
```

---

## Task 8: Info Tooltip and Documentation

**Files:**
- Create: `client/src/components/InfoTooltip.jsx`
- Modify: `client/src/App.jsx`

**Step 1: Create InfoTooltip component**

Create `client/src/components/InfoTooltip.jsx`:
```jsx
import { useState, useEffect } from 'react';

export default function InfoTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('boundarykeeper_tooltip_seen');
    if (!seen) {
      setIsOpen(true);
    } else {
      setHasSeenBefore(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('boundarykeeper_tooltip_seen', 'true');
    setHasSeenBefore(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-gray-900 font-medium"
      >
        ℹ️ What is this?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to Boundary Keeper
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Boundary Keeper helps you communicate effectively with difficult or high-conflict individuals using proven psychological techniques.
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  🪨 Grey Rock Method
                </h3>
                <p className="text-sm">
                  Emotionally neutral, brief, and factual responses. Like a boring grey rock, you become uninteresting to manipulative individuals by refusing to provide emotional reactions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  💛 Yellow Rock Method
                </h3>
                <p className="text-sm">
                  Grey rock with a touch of politeness. Perfect for co-parenting or situations where communications might be reviewed by courts or mediators. Maintains boundaries while appearing cooperative.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to use:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Paste the message you need to respond to</li>
                  <li>Click "Analyze Message"</li>
                  <li>See what makes it emotional</li>
                  <li>Choose grey or yellow rock version</li>
                  <li>Copy and use in your response</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 italic">
                Note: Your messages are processed using AI and saved only in your browser. Nothing is stored on our servers.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 2: Update App.jsx header**

Modify `client/src/App.jsx` header section:
```jsx
import InfoTooltip from './components/InfoTooltip';

// ... in the header section:
<header className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          🏔️ Boundary Keeper
        </h1>
        <p className="text-gray-600 mt-1">
          Transform emotional messages into neutral, effective responses
        </p>
      </div>
      <InfoTooltip />
    </div>
  </div>
</header>
```

**Step 3: Test info tooltip**

Test:
- First visit: tooltip auto-opens
- Can close tooltip
- Click "ℹ️ What is this?" to reopen
- localStorage tracks if seen

**Step 4: Commit info tooltip**

```bash
git add client/src/
git commit -m "feat: add info tooltip explaining grey and yellow rock

- Create InfoTooltip modal component
- Show automatically on first visit
- Add manual toggle in header
- Include usage instructions and method explanations"
```

---

## Task 9: Error Handling and Loading States

**Files:**
- Modify: `client/src/components/TextInput.jsx`
- Create: `client/src/components/LoadingSpinner.jsx`
- Modify: `client/src/App.jsx`

**Step 1: Create LoadingSpinner component**

Create `client/src/components/LoadingSpinner.jsx`:
```jsx
export default function LoadingSpinner({ message = 'Analyzing...' }) {
  return (
    <div className="card text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-2">
        This may take a few seconds...
      </p>
    </div>
  );
}
```

**Step 2: Update App.jsx with loading state**

Modify `client/src/App.jsx`:
```jsx
import LoadingSpinner from './components/LoadingSpinner';

// ... in the main section:
<main className="max-w-7xl mx-auto px-4 py-8">
  <ConversationHistory
    key={historyKey}
    onSelectConversation={handleSelectConversation}
  />
  <TextInput onAnalyze={handleAnalyze} loading={loading} />

  {loading && <LoadingSpinner />}
  {!loading && <AnalysisResults result={result} />}
</main>
```

**Step 3: Add better error handling in App**

Modify the handleAnalyze function in `client/src/App.jsx`:
```jsx
const handleAnalyze = async (text) => {
  setLoading(true);
  setResult(null);

  try {
    const data = await analyzeText(text);

    // Validate response structure
    if (!data.greyRock || !data.yellowRock) {
      throw new Error('Invalid response from server');
    }

    setResult(data);
    saveConversation(data);
    setHistoryKey(prev => prev + 1);
    toast.success('Analysis complete!');
  } catch (error) {
    console.error('Analysis error:', error);

    // More specific error messages
    if (error.message.includes('Network')) {
      toast.error('Network error. Please check your connection.');
    } else if (error.message.includes('timeout')) {
      toast.error('Request timed out. Please try again.');
    } else {
      toast.error(error.message || 'Analysis failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
```

**Step 4: Add input validation feedback**

Modify `client/src/components/TextInput.jsx` to show validation messages:
```jsx
// Add this helper function at top of component:
const getButtonDisabledReason = () => {
  if (!text.trim()) return 'Please enter some text';
  if (isOverLimit) return 'Text is too long';
  if (loading) return 'Analyzing...';
  return null;
};

const disabledReason = getButtonDisabledReason();

// Update button:
<button
  type="submit"
  disabled={!!disabledReason}
  className="btn-primary"
  title={disabledReason || ''}
>
  {loading ? 'Analyzing...' : 'Analyze Message'}
</button>
```

**Step 5: Test error handling**

Test scenarios:
1. Stop backend server → should show network error
2. Paste 6000 characters → should show too long
3. Normal analysis → should work

**Step 6: Commit error handling**

```bash
git add client/src/
git commit -m "feat: improve error handling and loading states

- Add LoadingSpinner component with animation
- Improve error messages for different failure types
- Add input validation feedback
- Validate API response structure"
```

---

## Task 10: Mobile Responsive Design

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/src/components/AnalysisResults.jsx`
- Modify: `client/src/components/ConversationHistory.jsx`

**Step 1: Update base styles for mobile**

Modify `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 font-sans;
  }

  html {
    @apply scroll-smooth;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 2: Make AnalysisResults responsive**

Modify `client/src/components/AnalysisResults.jsx`:
```jsx
// Update the grid:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

**Step 3: Make header responsive**

Modify `client/src/App.jsx` header:
```jsx
<header className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          🏔️ Boundary Keeper
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Transform emotional messages into neutral, effective responses
        </p>
      </div>
      <InfoTooltip />
    </div>
  </div>
</header>
```

**Step 4: Make TextInput responsive**

Modify `client/src/components/TextInput.jsx`:
```jsx
// Update the button row:
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
  <div className="flex gap-3">
    <button
      type="submit"
      disabled={!!disabledReason}
      className="btn-primary flex-1 sm:flex-none"
      title={disabledReason || ''}
    >
      {loading ? 'Analyzing...' : 'Analyze Message'}
    </button>

    <button
      type="button"
      onClick={handleClear}
      disabled={!text || loading}
      className="btn-secondary flex-1 sm:flex-none"
    >
      Clear
    </button>
  </div>

  <span className={`text-xs sm:text-sm text-center sm:text-right ${
    isOverLimit ? 'text-red-600 font-semibold' :
    isNearLimit ? 'text-yellow-600' :
    'text-gray-500'
  }`}>
    {charCount} / {maxChars}
  </span>
</div>
```

**Step 5: Test responsive design**

Test at different breakpoints:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px+

**Step 6: Commit responsive design**

```bash
git add client/src/
git commit -m "feat: make UI fully responsive for mobile

- Update grid layouts to stack on mobile
- Make header responsive with flexible layout
- Adjust button sizing for small screens
- Update spacing and text sizes for mobile
- Test at multiple breakpoints"
```

---

## Task 11: Documentation and README

**Files:**
- Create: `README.md`
- Create: `docs/development/setup.md`
- Create: `docs/api/endpoints.md`
- Create: `docs/user-guides/what-is-grey-rock.md`
- Create: `docs/user-guides/what-is-yellow-rock.md`
- Create: `docs/roadmap.md`

**Step 1: Create main README**

Create `README.md`:
```markdown
# 🏔️ Boundary Keeper

Transform emotional messages into neutral, effective responses using AI-powered grey rock and yellow rock methodologies.

## What is Boundary Keeper?

Boundary Keeper helps you communicate effectively with difficult or high-conflict individuals. Paste an emotional message, and get two neutral versions:

- **Grey Rock**: Emotionally neutral, brief, factual responses
- **Yellow Rock**: Grey rock with polite courtesy (ideal for co-parenting)

## Features

✅ Real-time AI analysis of emotional content
✅ Highlights emotional triggers in your text
✅ Generates both grey rock and yellow rock versions
✅ Copy-to-clipboard with one click
✅ Conversation history saved in your browser
✅ Privacy-first: nothing saved to servers
✅ Mobile-friendly responsive design

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Claude API key from Anthropic

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd boundarykeeper
```

2. **Set up the backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY
npm run dev
```

3. **Set up the frontend** (in new terminal)
```bash
cd client
npm install
npm run dev
```

4. **Visit** http://localhost:5173

## Documentation

- [Development Setup](docs/development/setup.md)
- [API Endpoints](docs/api/endpoints.md)
- [What is Grey Rock?](docs/user-guides/what-is-grey-rock.md)
- [What is Yellow Rock?](docs/user-guides/what-is-yellow-rock.md)
- [Roadmap](docs/roadmap.md)

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Axios

**Backend:**
- Node.js / Express
- Anthropic Claude API
- CORS & Helmet security

## Project Structure

```
boundarykeeper/
├── client/          # React frontend
├── server/          # Express backend
├── docs/            # Documentation
└── README.md
```

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT

## Support

For questions or issues, please open a GitHub issue.
```

**Step 2: Create setup guide**

Create `docs/development/setup.md`:
```markdown
# Development Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Claude API key from https://console.anthropic.com/

## Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```
CLAUDE_API_KEY=sk-ant-your-key-here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

5. Start development server:
```bash
npm run dev
```

Server runs on http://localhost:3001

## Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env`:
```
VITE_API_URL=http://localhost:3001
```

5. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:5173

## Testing

Backend tests:
```bash
cd server
npm test
```

Frontend tests:
```bash
cd client
npm test
```

## Building for Production

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run build
```

Build output in `client/dist/`
```

**Step 3: Create API documentation**

Create `docs/api/endpoints.md`:
```markdown
# API Endpoints

Base URL: `http://localhost:3001`

## POST /api/analyze

Analyzes text and returns grey rock + yellow rock versions.

### Request

```json
{
  "text": "I can't believe you're doing this again!"
}
```

### Response (200 OK)

```json
{
  "original": "I can't believe you're doing this again!",
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
    "explanation": "Removed all emotional content..."
  },
  "yellowRock": {
    "text": "Thank you for letting me know.",
    "explanation": "Maintained neutrality with politeness..."
  }
}
```

### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": true,
  "message": "Text is required",
  "code": "INVALID_INPUT"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": true,
  "message": "Too many requests. Please try again in a moment.",
  "code": "RATE_LIMIT"
}
```

**503 Service Unavailable** - API error
```json
{
  "error": true,
  "message": "Service temporarily unavailable. Please try again.",
  "code": "SERVICE_ERROR"
}
```

## GET /health

Health check endpoint.

### Response (200 OK)

```json
{
  "status": "ok"
}
```
```

**Step 4: Create user guides**

Create `docs/user-guides/what-is-grey-rock.md`:
```markdown
# What is Grey Rock?

Grey rock is a communication technique where you become emotionally unresponsive—like a boring, unremarkable grey rock.

## How It Works

The method operates by cutting off "narcissistic supply": the attention, emotional reactions, and validation that manipulative individuals crave.

## Core Principles

1. **Emotional Detachment** - No emotional reactions
2. **Minimal Engagement** - Brief, factual responses only
3. **Be Uninteresting** - Provide no personal information
4. **Strategic Disengagement** - Don't take the bait

## Example

**Before:** "I can't believe you're accusing me of that! I've been working so hard on this project and you never appreciate anything I do!"

**After:** "I received your feedback. The project is on schedule."

## When to Use

- Workplace situations with difficult colleagues
- Brief family encounters
- Situations where complete no-contact isn't feasible
- Any interaction with manipulative individuals

## When NOT to Use

- In situations with physical violence risk
- In intimate relationships (where no-contact is better)
- As a permanent lifestyle (it's a temporary strategy)

## Learn More

- Psychology Central articles on grey rock
- "The Wizard of Oz and Other Narcissists" by Eleanor Payson
```

Create `docs/user-guides/what-is-yellow-rock.md`:
```markdown
# What is Yellow Rock?

Yellow rock is an evolution of grey rock, adding minimal politeness while maintaining emotional neutrality.

## Why Yellow Rock?

Family courts value cooperation and reasonableness. Pure grey rock can appear:
- Cold or uncooperative
- Bitter or hostile
- Uninterested in co-parenting

Yellow rock solves this by adding a "warmer" veneer without sacrificing boundaries.

## Core Principles

1. **Maintain grey rock boundaries** - Still emotionally neutral
2. **Add polite markers** - "Thank you," "Please"
3. **Focus on logistics** - Only facts about children/situation
4. **Court-friendly** - Appears cooperative to judges

## Example

**Before (emotional):** "I'm so frustrated that you keep changing the pickup times! Our kids need consistency and you're making everything harder!"

**Grey Rock:** "Pickup is 5pm Friday."

**Yellow Rock:** "Pickup is scheduled for 5pm Friday. Please confirm."

## When to Use

- Co-parenting communications
- Any messages that might be reviewed by courts
- Mediation situations
- When you need to appear cooperative

## Key Difference from Grey Rock

- **Grey Rock**: Minimal, neutral
- **Yellow Rock**: Polite, neutral

Both refuse to engage emotionally, but yellow rock maintains a courteous tone.

## Learn More

- One Mom's Battle resources
- High-conflict co-parenting guides
```

**Step 5: Create roadmap**

Create `docs/roadmap.md`:
```markdown
# Boundary Keeper Roadmap

## MVP (Current - Week 1-4) ✅

- [x] Basic text analysis
- [x] Grey and yellow rock generation
- [x] Emotional highlighting
- [x] Copy to clipboard
- [x] Browser history (localStorage)
- [x] Mobile responsive
- [x] Info tooltip

## Phase 2 (Months 2-3)

### Enhanced Features
- [ ] Template library for common scenarios
- [ ] User accounts and cloud sync
- [ ] Advanced pattern recognition
- [ ] Export to PDF
- [ ] Custom tone preferences
- [ ] Dark mode

### Quality Improvements
- [ ] A/B testing different prompts
- [ ] User feedback system
- [ ] Analytics (privacy-preserving)
- [ ] Performance optimizations

## Phase 3 (Months 4-6)

### Co-Parenting Focus
- [ ] Shared calendars
- [ ] Custody schedule management
- [ ] Expense tracking
- [ ] GPS-verified exchanges
- [ ] Court-admissible documentation

### Professional Features
- [ ] Therapist/attorney access portals
- [ ] Bulk licensing
- [ ] White-label options
- [ ] API for integrations

## Phase 4 (Months 7-12)

### Mobile Apps
- [ ] iOS native app
- [ ] Android native app
- [ ] Browser extension (Chrome/Firefox)

### Advanced AI
- [ ] On-device processing (privacy)
- [ ] Context-aware suggestions
- [ ] Learning from user corrections
- [ ] Multiple language support

### Platform Growth
- [ ] HIPAA compliance
- [ ] GDPR compliance
- [ ] Court system partnerships
- [ ] Therapist referral network

## Long-term Vision

See `Boundary Keeper Plan.pdf` for comprehensive feature set including:
- Real-time collaboration with therapists
- Pattern recognition showing escalation
- Integration with practice management software
- International expansion
- Research partnerships

## Success Metrics

**MVP Success:**
- 100+ active users
- 70%+ positive feedback
- 20%+ repeat usage rate

**Phase 2 Success:**
- 1,000+ users
- 10%+ conversion to paid
- 5+ therapist partnerships

**Phase 3 Success:**
- 10,000+ users
- $10K+ MRR
- 50+ professional partners
```

**Step 6: Commit documentation**

```bash
git add README.md docs/
git commit -m "docs: add comprehensive project documentation

- Create main README with quick start guide
- Add development setup instructions
- Document all API endpoints
- Create user guides for grey and yellow rock
- Add product roadmap with phases"
```

---

## Task 12: Final Polish and Deployment Prep

**Files:**
- Create: `.gitignore` (root)
- Create: `client/.env.example`
- Create: `server/.env.example` (already done)
- Modify: `client/package.json`
- Modify: `server/package.json`

**Step 1: Create root .gitignore**

Create `.gitignore`:
```
# Environment files
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build outputs
dist/
dist-ssr/
build/

# Logs
*.log
npm-debug.log*
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Misc
.cache/
```

**Step 2: Create client .env.example**

Create `client/.env.example`:
```
VITE_API_URL=http://localhost:3001
```

**Step 3: Update package.json metadata**

Modify `client/package.json`:
```json
{
  "name": "boundary-keeper-client",
  "version": "1.0.0",
  "description": "Boundary Keeper - Grey Rock Communication Assistant",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-hot-toast": "^2.4.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

Modify `server/package.json`:
```json
{
  "name": "boundary-keeper-server",
  "version": "1.0.0",
  "description": "Backend API for Boundary Keeper - Grey Rock Communication Assistant",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "keywords": ["grey-rock", "yellow-rock", "communication", "api", "claude"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "@anthropic-ai/sdk": "^0.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
```

**Step 4: Add deployment instructions to docs**

Create `docs/deployment.md`:
```markdown
# Deployment Guide

## Deploying to Production

### Backend (Railway)

1. Create Railway account at https://railway.app
2. Create new project from GitHub
3. Configure:
   - Root directory: `server/`
   - Start command: `npm start`
4. Add environment variables:
   - `CLAUDE_API_KEY`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://yourdomain.com`
5. Deploy!

Railway URL will be: `https://your-app.up.railway.app`

### Frontend (Vercel)

1. Create Vercel account at https://vercel.com
2. Import GitHub repository
3. Configure:
   - Framework: Vite
   - Root directory: `client/`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.railway.app`
5. Deploy!

### Custom Domain

**Frontend (Vercel):**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS:
   - A record: 76.76.21.21
   - Or CNAME: cname.vercel-dns.com

**Backend (Railway):**
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS:
   - CNAME `api.yourdomain.com` → Railway URL

### Post-Deployment

1. Test all functionality in production
2. Check CORS settings
3. Monitor logs for errors
4. Set up error tracking (e.g., Sentry)
5. Monitor API usage and costs

## Environment Variables Checklist

**Backend:**
- [ ] CLAUDE_API_KEY
- [ ] NODE_ENV
- [ ] ALLOWED_ORIGINS
- [ ] PORT (optional, Railway auto-assigns)

**Frontend:**
- [ ] VITE_API_URL
```

**Step 5: Final testing checklist**

Create `docs/testing-checklist.md`:
```markdown
# Final Testing Checklist

## Functionality Tests

### Core Features
- [ ] Paste text into textarea
- [ ] Click "Analyze Message"
- [ ] See loading spinner
- [ ] Results appear with all sections
- [ ] Emotional highlights work
- [ ] Hover tooltips show reasons
- [ ] Grey rock version displays
- [ ] Yellow rock version displays
- [ ] Copy buttons work
- [ ] Toast notifications appear
- [ ] History saves automatically
- [ ] Can load from history
- [ ] Can clear history
- [ ] Info tooltip opens/closes

### Edge Cases
- [ ] Empty text (button disabled)
- [ ] Very long text (>5000 chars warning)
- [ ] Special characters
- [ ] Network error handling
- [ ] API timeout handling
- [ ] Invalid API response

### Mobile Testing
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Buttons are tappable
- [ ] Text is readable
- [ ] Layout doesn't break

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Performance Tests
- [ ] Page loads in < 2 seconds
- [ ] API responds in < 5 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

## Security Tests
- [ ] API key not exposed in client
- [ ] CORS configured correctly
- [ ] No XSS vulnerabilities
- [ ] Input sanitization works

## Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
```

**Step 6: Commit final polish**

```bash
git add .
git commit -m "chore: final polish and deployment prep

- Add comprehensive .gitignore
- Create .env.example files
- Update package.json metadata
- Add deployment documentation
- Create testing checklist"
```

**Step 7: Create final release commit**

```bash
git tag -a v1.0.0 -m "MVP Release v1.0.0

Features:
- AI-powered text analysis using Claude API
- Grey rock and yellow rock generation
- Emotional highlighting with tooltips
- Copy to clipboard functionality
- Conversation history (localStorage)
- Mobile responsive design
- Info tooltip and documentation
- Comprehensive error handling

Ready for deployment to Railway + Vercel"
```

---

## Implementation Complete!

The plan is complete and ready for execution. All tasks are broken down into small, actionable steps with exact file paths and complete code.

**Next Steps:**
1. Execute this plan using `superpowers:executing-plans` OR
2. Use `superpowers:subagent-driven-development` in this session

**Estimated Time:** 2-4 weeks for full MVP implementation
