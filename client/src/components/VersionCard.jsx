import { useState } from 'react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/clipboard';

export default function VersionCard({
  title,
  text,
  explanation,
  variant = 'grey'
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${title} copied to clipboard!`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const bgColor = variant === 'grey' ? 'bg-gray-50' : 'bg-yellow-50';
  const borderColor = variant === 'grey' ? 'border-gray-300' : 'border-yellow-300';

  return (
    <div className={`card ${bgColor} ${borderColor}`}>
      <h3 className="font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-gray-700 whitespace-pre-wrap mb-4 min-h-[60px]">
        {text}
      </p>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="btn-secondary w-full"
        >
          📋 Copy
        </button>

        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-sm text-gray-600 hover:text-gray-900 w-full text-left flex items-center gap-1"
          >
            <span>{showExplanation ? '▼' : '▶'}</span>
            Why did this change?
          </button>
        )}

        {showExplanation && explanation && (
          <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
}
