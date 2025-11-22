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
