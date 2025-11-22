import { useState, useEffect } from 'react';
import { getAvailableModels } from '../services/api';

/**
 * ModelSelector Component
 * Displays checkboxes for selecting which LLM models to use for analysis
 */
function ModelSelector({ selectedModels, onModelChange, disabled }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const availableModels = await getAvailableModels();
      setModels(availableModels);
      setError(null);
    } catch (err) {
      console.error('Failed to load models:', err);
      setError('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (modelId) => {
    if (disabled) return;

    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];

    onModelChange(newSelection);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Select AI Models
        </h3>
        <p className="text-sm text-gray-500">Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Select AI Models
        </h3>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadModels}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Select AI Models
      </h3>
      <p className="text-xs text-gray-600 mb-3">
        Choose one or more models to compare their responses
      </p>

      <div className="space-y-2">
        {models.map((model) => (
          <label
            key={model.id}
            className={`flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedModels.includes(model.id)}
              onChange={() => handleToggle(model.id)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {model.displayName}
              </div>
              <div className="text-xs text-gray-500">
                {model.provider} • {model.model}
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedModels.length === 0 && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded p-2">
          ⚠️ No models selected. The default model will be used.
        </p>
      )}

      {selectedModels.length > 0 && (
        <p className="mt-3 text-xs text-blue-600 bg-blue-50 rounded p-2">
          ✓ {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

export default ModelSelector;
