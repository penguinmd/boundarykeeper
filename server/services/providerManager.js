const ClaudeProvider = require('./providers/claudeProvider');
const OpenAIProvider = require('./providers/openaiProvider');

/**
 * Provider Manager
 * Manages multiple LLM providers and models
 */
class ProviderManager {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize all available providers with their models
   */
  initializeProviders() {
    // Claude models
    this.providers.set('claude-sonnet-4-5', new ClaudeProvider({
      model: 'claude-sonnet-4-5-20250929'
    }));

    this.providers.set('claude-haiku-4-5', new ClaudeProvider({
      model: 'claude-haiku-4-5'
    }));

    this.providers.set('claude-sonnet-4', new ClaudeProvider({
      model: 'claude-sonnet-4-20250514'
    }));

    // OpenAI models
    this.providers.set('gpt-5', new OpenAIProvider({
      model: 'gpt-5'
    }));

    this.providers.set('gpt-4', new OpenAIProvider({
      model: 'gpt-4'
    }));

    this.providers.set('gpt-4o-mini', new OpenAIProvider({
      model: 'gpt-4o-mini'
    }));
  }

  /**
   * Get list of all available models
   */
  getAvailableModels() {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      provider: provider.providerName,
      model: provider.modelName,
      displayName: this.getDisplayName(id, provider)
    }));
  }

  /**
   * Get user-friendly display name for a model
   */
  getDisplayName(id, provider) {
    const displayNames = {
      'claude-sonnet-4-5': 'Claude Sonnet 4.5 (Latest)',
      'claude-haiku-4-5': 'Claude Haiku 4.5 (Fast)',
      'claude-sonnet-4': 'Claude Sonnet 4',
      'gpt-5': 'GPT-5 (Latest)',
      'gpt-4': 'GPT-4',
      'gpt-4o-mini': 'GPT-4o Mini (Fast)'
    };
    return displayNames[id] || `${provider.providerName} - ${provider.modelName}`;
  }

  /**
   * Analyze text with a specific model
   * @param {string} modelId - The model identifier
   * @param {string} text - The text to analyze
   */
  async analyzeWithModel(modelId, text) {
    const provider = this.providers.get(modelId);
    if (!provider) {
      throw new Error(`Model ${modelId} not found`);
    }

    try {
      const result = await provider.analyzeText(text);
      return {
        modelId,
        displayName: this.getDisplayName(modelId, provider),
        ...result
      };
    } catch (error) {
      console.error(`Error with ${modelId}:`, error);
      return {
        modelId,
        displayName: this.getDisplayName(modelId, provider),
        error: error.message || 'Analysis failed',
        provider: provider.providerName,
        model: provider.modelName
      };
    }
  }

  /**
   * Analyze text with multiple models in parallel
   * @param {string[]} modelIds - Array of model identifiers
   * @param {string} text - The text to analyze
   */
  async analyzeWithMultipleModels(modelIds, text) {
    if (!modelIds || modelIds.length === 0) {
      // Default to Claude Sonnet 4 if no models specified
      modelIds = ['claude-sonnet-4'];
    }

    const promises = modelIds.map(modelId =>
      this.analyzeWithModel(modelId, text)
    );

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          modelId: modelIds[index],
          error: result.reason?.message || 'Analysis failed'
        };
      }
    });
  }
}

// Export singleton instance
module.exports = new ProviderManager();
