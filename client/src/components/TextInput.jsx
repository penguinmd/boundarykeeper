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
    <div className="card">
      <form onSubmit={handleSubmit}>
        <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-2">
          Your Message
        </label>

        <textarea
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the message you need to respond to..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base"
          disabled={loading}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              disabled={!!disabledReason}
              className="btn-primary flex-1 sm:flex-none"
              title={disabledReason || ''}
            >
              {loading ? 'Analyzing...' : 'Analyze Message'}
            </button>

            <button
              type="button"
              onClick={handleFillDemo}
              disabled={loading}
              className="btn-secondary flex-1 sm:flex-none"
              title="Fill with demo text to see how it works"
            >
              Try Demo
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!text || loading}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Clear
            </button>
          </div>

          <span className={`text-xs sm:text-sm text-center sm:text-right ${
            isOverLimit ? 'text-red-600 font-semibold' :
            isNearLimit ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </form>
    </div>
  );
}
