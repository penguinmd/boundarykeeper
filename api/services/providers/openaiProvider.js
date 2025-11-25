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
      // GPT-5, GPT-5.1, and o-series are reasoning models with different constraints
      const isReasoningModel = this.modelName.startsWith('gpt-5') ||
                                this.modelName.startsWith('o1') ||
                                this.modelName.startsWith('o3');

      const requestParams = {
        model: this.modelName,
        messages: []
      };

      // Reasoning models (GPT-5, o1, o3) don't support system prompts
      // Combine system and user prompts into a single user message
      if (isReasoningModel) {
        requestParams.messages = [
          {
            role: 'user',
            content: this.getSystemPrompt() + '\n\n' + this.getUserPrompt(text)
          }
        ];
      } else {
        requestParams.messages = [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: this.getUserPrompt(text)
          }
        ];
      }

      // Reasoning models only support default temperature (1.0)
      if (!isReasoningModel) {
        requestParams.temperature = 0.7;
      }

      // Use appropriate token limit parameter based on model
      if (isReasoningModel) {
        requestParams.max_completion_tokens = 2048;
        // GPT-5 and GPT-5.1 reasoning models require reasoning_effort parameter
        if (this.modelName.startsWith('gpt-5')) {
          // GPT-5.1 models only support 'medium', older GPT-5 supports 'low'
          if (this.modelName.startsWith('gpt-5.1')) {
            requestParams.reasoning_effort = 'medium';
          } else {
            requestParams.reasoning_effort = 'low';
          }
        }
      } else {
        requestParams.max_tokens = 2048;
        // Only non-reasoning models support response_format
        requestParams.response_format = { type: "json_object" };
      }

      const completion = await this.client.chat.completions.create(requestParams);

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
