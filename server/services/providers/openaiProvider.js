const OpenAI = require('openai');
const BaseProvider = require('./baseProvider');

/**
 * OpenAI Provider supporting GPT models
 * Supports GPT-4, GPT-3.5-turbo, and other OpenAI models
 */
class OpenAIProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'openai';
    this.modelName = config.model || 'gpt-4';

    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async analyzeText(text) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: this.getUserPrompt(text)
          }
        ]
      });

      const responseText = completion.choices[0].message.content;
      const result = this.extractJSON(responseText);

      return {
        ...result,
        provider: this.providerName,
        model: this.modelName
      };
    } catch (error) {
      console.error(`OpenAI API error (${this.modelName}):`, error);
      throw error;
    }
  }
}

module.exports = OpenAIProvider;
