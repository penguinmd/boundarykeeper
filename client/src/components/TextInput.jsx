import { useState } from 'react';

const DEMO_TEXT = `I can't believe you're changing the schedule AGAIN with only two days notice. This is the third time this month you've decided your plans are more important than our agreement. You know I have to rearrange my entire work schedule to accommodate this, but I guess that doesn't matter to you.

I'm also still waiting for you to pay your half of the school supplies like we agreed. It's been three weeks since I sent you the receipts. I shouldn't have to keep asking you to follow through on things you already committed to. But sure, go ahead and make your last-minute plans while I deal with everything else like always.`;

export default function TextInput({ onAnalyze, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const handleFillDemo = () => {
    setText(DEMO_TEXT);
  };

  const charCount = text.length;
  const maxChars = 5000;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;

  const getButtonDisabledReason = () => {
    if (!text.trim()) return 'Please enter some text';
    if (isOverLimit) return 'Text is too long';
    if (loading) return 'Analyzing...';
    return null;
  };

  const disabledReason = getButtonDisabledReason();

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <textarea
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the message you need to respond to..."
          className="w-full h-48 sm:h-64 p-6 bg-transparent border-none resize-none text-lg leading-relaxed placeholder:text-slate-300 focus:ring-0 text-slate-700"
          disabled={loading}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className={`text-xs font-medium transition-colors ${isOverLimit ? 'text-red-500' :
            isNearLimit ? 'text-amber-500' :
              'text-slate-300'
            }`}>
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={loading || text.length > 0}
            className="text-sm font-medium text-slate-400 hover:text-blue-600 disabled:opacity-0 transition-all"
          >
            Example Demonstration
          </button>

          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="text-sm font-medium text-slate-400 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!!disabledReason}
          className="btn-primary flex items-center gap-2 shadow-blue-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Message</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
