import { useState, useEffect } from 'react';
import { getAvailableModels } from '../services/api';

/**
 * ModelSelector Component
 * Displays checkboxes for selecting which LLM models to use for analysis
 * Collapsible drawer to reduce UI clutter
 */
function ModelSelector({ selectedModels, onModelChange, disabled }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const availableModels = await getAvailableModels();
      setModels(availableModels);
      setError(null);

      // Auto-select Claude if no models are selected
      if (selectedModels.length === 0) {
        const claudeModel = availableModels.find(m =>
          m.id.toLowerCase().includes('claude') ||
          m.displayName.toLowerCase().includes('claude')
        );
        if (claudeModel) {
          onModelChange([claudeModel.id]);
        }
      }
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
      <div className="animate-pulse flex space-x-4 items-center">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 flex items-center gap-2">
        <span>{error}</span>
        <button
          onClick={loadModels}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const getSelectedModelNames = () => {
    if (selectedModels.length === 0) return 'Default (Claude)';
    if (selectedModels.length === 1) {
      const model = models.find(m => m.id === selectedModels[0]);
      return model?.displayName || selectedModels[0];
    }
    return `${selectedModels.length} models`;
  };

  return (
    <div>
      {/* Collapsible Header */}
      <button
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
          ${isExpanded ? 'bg-slate-50 border-slate-300 mb-3' : 'bg-white border-slate-200'}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🤖</span>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-700">
              AI Models
            </h3>
            <p className="text-xs text-slate-500">
              {getSelectedModelNames()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
            {selectedModels.length || 1}
          </span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Model Grid */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-2">
          {models.map((model) => (
            <label
              key={model.id}
              className={`
                relative p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${selectedModels.includes(model.id)
                  ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(model.id)}
                onChange={() => handleToggle(model.id)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`
                  mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors
                  ${selectedModels.includes(model.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-300 bg-white'}
                `}>
                  {selectedModels.includes(model.id) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className={`text-sm font-medium ${selectedModels.includes(model.id) ? 'text-blue-900' : 'text-slate-700'}`}>
                    {model.displayName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {model.provider}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModelSelector;
