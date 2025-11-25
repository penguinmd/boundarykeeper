const ClaudeProvider = require('./providers/claudeProvider');
const OpenAIProvider = require('./providers/openaiProvider');
const GeminiProvider = require('./providers/geminiProvider');

/**
 * Model configuration with display names
 * Single source of truth for all model metadata
 */
const MODEL_CONFIG = {
  // Claude models
  'claude-sonnet-4-5': {
    Provider: ClaudeProvider,
    model: 'claude-sonnet-4-5-20250929',
    displayName: 'Claude Sonnet 4.5 (Latest)'
  },
  'claude-haiku-4-5': {
    Provider: ClaudeProvider,
    model: 'claude-haiku-4-5',
    displayName: 'Claude Haiku 4.5 (Fast)'
  },
  'claude-sonnet-4': {
    Provider: ClaudeProvider,
    model: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4'
  },
  // OpenAI models
  'gpt-5.1': {
    Provider: OpenAIProvider,
    model: 'gpt-5.1',
    displayName: 'GPT-5.1 Thinking (Latest)'
  },
  'gpt-5.1-chat-latest': {
    Provider: OpenAIProvider,
    model: 'gpt-5.1-chat-latest',
    displayName: 'GPT-5.1 Instant (Fast)'
  },
  'gpt-4': {
    Provider: OpenAIProvider,
    model: 'gpt-4',
    displayName: 'GPT-4'
  },
  'gpt-4o-mini': {
    Provider: OpenAIProvider,
    model: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini (Fast)'
  },
  // Google Gemini models
  'gemini-2.5-pro': {
    Provider: GeminiProvider,
    model: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro (Latest)'
  },
  'gemini-2.5-flash': {
    Provider: GeminiProvider,
    model: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash (Fast)'
  }
};

/**
 * Provider Manager
 * Manages multiple LLM providers and models
 */
class ProviderManager {
  constructor() {
    this.providers = new Map();
    this.modelConfig = MODEL_CONFIG;
    this.initializeProviders();
  }

  /**
   * Initialize all available providers with their models
   */
  initializeProviders() {
    for (const [id, config] of Object.entries(this.modelConfig)) {
      const { Provider, model } = config;
      this.providers.set(id, new Provider({ model }));
    }
  }

  /**
   * Get list of all available models
   */
  getAvailableModels() {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      provider: provider.providerName,
      model: provider.modelName,
      displayName: this.modelConfig[id].displayName
    }));
  }

  /**
   * Get user-friendly display name for a model
   */
  getDisplayName(id, provider) {
    return this.modelConfig[id]?.displayName || `${provider.providerName} - ${provider.modelName}`;
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
