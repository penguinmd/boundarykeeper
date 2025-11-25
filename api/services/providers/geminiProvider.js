const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseProvider = require('./baseProvider');

/**
 * Google Gemini Provider
 * Supports Gemini Pro, Gemini Flash, and other Gemini models
 */
class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'gemini';
    this.modelName = config.model || 'gemini-pro';

    this.client = new GoogleGenerativeAI(
      config.apiKey || process.env.GEMINI_API_KEY
    );
    this.model = this.client.getGenerativeModel({ model: this.modelName });
  }

  async analyzeText(text) {
    try {
      const prompt = `${this.getSystemPrompt()}

${this.getUserPrompt(text)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const parsedResult = this.extractJSON(responseText);

      return {
        ...parsedResult,
        provider: this.providerName,
        model: this.modelName
      };
    } catch (error) {
      console.error(`Gemini API error (${this.modelName}):`, error);
      throw error;
    }
  }
}

module.exports = GeminiProvider;
