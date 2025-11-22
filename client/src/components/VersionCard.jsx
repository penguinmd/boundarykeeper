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
      toast.success(`${title} copied!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  const isGrey = variant === 'grey';

  const cardStyles = isGrey
    ? 'bg-slate-50 border-slate-200'
    : 'bg-amber-50/50 border-amber-200';

  const titleColor = isGrey ? 'text-slate-700' : 'text-amber-900';
  const textColor = isGrey ? 'text-slate-600' : 'text-slate-700';

  return (
    <div className={`card h-full flex flex-col ${cardStyles}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${titleColor}`}>
          <span className={`w-2 h-2 rounded-full ${isGrey ? 'bg-slate-400' : 'bg-amber-400'}`}></span>
          {title}
        </h3>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
        >
          Copy
        </button>
      </div>

      <div className={`flex-grow whitespace-pre-wrap mb-6 text-sm leading-relaxed ${textColor}`}>
        {text}
      </div>

      {explanation && (
        <div className="mt-auto pt-4 border-t border-slate-200/50">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span>Why this works</span>
            <span className={`transform transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${showExplanation ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}
          `}>
            <p className="text-xs text-slate-500 bg-white/50 p-3 rounded-lg border border-slate-100">
              {explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
