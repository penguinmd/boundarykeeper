const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are a communication expert specializing in grey rock and yellow rock methodologies for managing difficult conversations with high-conflict personalities.

Grey rock: Emotionally neutral, brief, factual only. No engagement with provocations.
Yellow rock: Grey rock + minimal politeness markers. Suitable for court-reviewed communications.

Your task:
1. Analyze the emotional content
2. Identify specific emotional triggers and their locations in the text
3. Provide both grey rock and yellow rock rewrites
4. Explain what changed and why`;

async function analyzeText(text, apiKey) {
  const client = new Anthropic({ apiKey });

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

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

    // Get API key from environment
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    // Call Claude API
    const result = await analyzeText(text, apiKey);

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
};
