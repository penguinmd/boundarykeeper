# Multi-Provider LLM Support

Boundary Keeper now supports multiple LLM providers to compare responses across different models!

## Supported Providers & Models

### Claude (Anthropic)
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`) - Current default, balanced performance

### OpenAI
- **GPT-4** (`gpt-4`) - Most capable, complex reasoning
- **GPT-3.5 Turbo** (`gpt-3.5-turbo`) - Fast and cost-effective

### Google Gemini
- **Gemini 1.5 Pro** (`gemini-1.5-pro`) - Advanced capabilities
- **Gemini 1.5 Flash** (`gemini-1.5-flash`) - Fast and efficient

## Setup

### 1. Configure API Keys

Add your API keys to the server environment variables:

```bash
# server/.env
CLAUDE_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Vercel Deployment

For production deployment on Vercel, add the environment variables in your Vercel project settings:
- `CLAUDE_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

## Usage

### Frontend (UI)

1. **Select Models**: Use the checkboxes in the "Select AI Models" section to choose which models to compare
2. **Analyze**: Submit your text as usual
3. **Compare Results**: See responses from all selected models displayed in separate sections

### API

#### Get Available Models

```bash
GET /api/models
```

Response:
```json
{
  "models": [
    {
      "id": "claude-sonnet-4",
      "provider": "claude",
      "model": "claude-sonnet-4-20250514",
      "displayName": "Claude Sonnet 4 (Current)"
    },
    {
      "id": "gpt-4",
      "provider": "openai",
      "model": "gpt-4",
      "displayName": "GPT-4 (Complex)"
    }
    // ... more models
  ]
}
```

#### Analyze Text with Multiple Models

```bash
POST /api/analyze
Content-Type: application/json

{
  "text": "Your message here",
  "models": ["claude-sonnet-4", "gpt-4", "gemini-pro"]
}
```

Response:
```json
{
  "original": "Your message here",
  "results": [
    {
      "modelId": "claude-sonnet-4",
      "displayName": "Claude Sonnet 4 (Current)",
      "provider": "claude",
      "model": "claude-sonnet-4-20250514",
      "emotions": { /* ... */ },
      "greyRock": { /* ... */ },
      "yellowRock": { /* ... */ }
    },
    {
      "modelId": "gpt-4",
      "displayName": "GPT-4 (Complex)",
      "provider": "openai",
      "model": "gpt-4",
      "emotions": { /* ... */ },
      "greyRock": { /* ... */ },
      "yellowRock": { /* ... */ }
    }
    // ... more results
  ]
}
```

If no models are specified, the default (Claude Sonnet 4) will be used.

## Architecture

### Provider Abstraction Layer

All providers extend from `BaseProvider`:

```
server/services/
├── providers/
│   ├── baseProvider.js      # Base class with common logic
│   ├── claudeProvider.js    # Anthropic Claude implementation
│   ├── openaiProvider.js    # OpenAI GPT implementation
│   └── geminiProvider.js    # Google Gemini implementation
└── providerManager.js       # Manages all providers
```

### Adding New Providers

1. Create a new provider class extending `BaseProvider`
2. Implement the `analyzeText(text)` method
3. Register the provider in `providerManager.js`

Example:
```javascript
const BaseProvider = require('./baseProvider');

class MyProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'myprovider';
    this.modelName = config.model || 'default-model';
    // Initialize your SDK client
  }

  async analyzeText(text) {
    // Call your LLM API
    // Extract and return the JSON response
    return {
      ...result,
      provider: this.providerName,
      model: this.modelName
    };
  }
}
```

## Cost Considerations

Different models have different costs:
- **GPT-4**: Most expensive, highest quality
- **GPT-3.5 Turbo**: Cheapest, good quality
- **Claude Sonnet 4**: Moderate cost, excellent quality
- **Gemini Pro**: Moderate cost, strong capabilities
- **Gemini Flash**: Low cost, fast responses

Select models based on your budget and quality requirements.

## Error Handling

If a model fails (e.g., API key missing, rate limit, network error):
- Other models will continue processing
- The failed model will show an error message
- Partial results will still be returned

## Performance

- Multiple models are analyzed **in parallel** for faster results
- Total time ≈ slowest model's response time
- Timeout increased to 60 seconds for multiple models
