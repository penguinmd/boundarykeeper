/**
 * Base Provider class for LLM integrations
 * All providers should extend this class and implement the analyzeText method
 */
class BaseProvider {
  constructor(config) {
    this.config = config;
    this.providerName = 'base';
    this.modelName = '';
  }

  /**
   * System prompt used for all providers
   */
  getSystemPrompt() {
    return `You are a communication expert specializing in grey rock and yellow rock methodologies for managing difficult conversations with high-conflict personalities.

Grey rock: Emotionally neutral, brief, factual only. No engagement with provocations.
Yellow rock: Grey rock + minimal politeness markers. Suitable for court-reviewed communications.

Your task:
1. Analyze the emotional content
2. Identify specific emotional triggers and their locations in the text
3. Provide both grey rock and yellow rock rewrites
4. Explain what changed and why`;
  }

  /**
   * User prompt template for analysis
   */
  getUserPrompt(text) {
    return `Analyze this message and provide a complete response:

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
  }

  /**
   * Extract JSON from response text
   * Handles responses that may contain markdown or other text around the JSON
   */
  extractJSON(responseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in ${this.providerName} response`);
    }
    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Analyze text - must be implemented by subclasses
   * @param {string} text - The text to analyze
   * @returns {Promise<Object>} Analysis result with emotions, greyRock, and yellowRock
   */
  async analyzeText(text) {
    throw new Error('analyzeText must be implemented by provider subclass');
  }

  /**
   * Get provider info for display
   */
  getInfo() {
    return {
      provider: this.providerName,
      model: this.modelName
    };
  }
}

module.exports = BaseProvider;
