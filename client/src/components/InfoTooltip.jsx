import { useState, useEffect } from 'react';

export default function InfoTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('boundarykeeper_tooltip_seen');
    if (!seen) {
      setIsOpen(true);
    } else {
      setHasSeenBefore(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('boundarykeeper_tooltip_seen', 'true');
    setHasSeenBefore(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
      >
        ℹ️ What is this?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to Boundary Keeper
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Boundary Keeper helps you communicate effectively with difficult or high-conflict individuals using proven psychological techniques.
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  🪨 Grey Rock Method
                </h3>
                <p className="text-sm">
                  Emotionally neutral, brief, and factual responses. Like a boring grey rock, you become uninteresting to manipulative individuals by refusing to provide emotional reactions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  💛 Yellow Rock Method
                </h3>
                <p className="text-sm">
                  Grey rock with a touch of politeness. Perfect for co-parenting or situations where communications might be reviewed by courts or mediators. Maintains boundaries while appearing cooperative.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to use:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Paste the message you need to respond to</li>
                  <li>Click "Analyze Message"</li>
                  <li>See what makes it emotional</li>
                  <li>Choose grey or yellow rock version</li>
                  <li>Copy and use in your response</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 italic">
                Note: Your messages are processed using AI and saved only in your browser. Nothing is stored on our servers.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
