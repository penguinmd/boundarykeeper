const Anthropic = require('@anthropic-ai/sdk');
const BaseProvider = require('./baseProvider');

/**
 * Claude Provider using Anthropic SDK
 * Supports multiple Claude models
 */
class ClaudeProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'claude';
    this.modelName = config.model || 'claude-sonnet-4-20250514';

    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.CLAUDE_API_KEY,
    });
  }

  async analyzeText(text) {
    try {
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 2048,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: this.getUserPrompt(text)
          }
        ]
      });

      const responseText = message.content[0].text;
      const result = this.extractJSON(responseText);

      return {
        ...result,
        provider: this.providerName,
        model: this.modelName
      };
    } catch (error) {
      console.error(`Claude API error (${this.modelName}):`, error);
      throw error;
    }
  }
}

module.exports = ClaudeProvider;
