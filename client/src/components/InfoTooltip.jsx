import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
        className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors flex items-center gap-2"
      >
        <span>ℹ️</span>
        <span className="hidden sm:inline">How it works</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in border border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to Boundary Keeper
                </h2>
                <p className="text-slate-500 mt-1">
                  Your professional communication assistant
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-slate-600">
              <p className="text-lg leading-relaxed">
                Boundary Keeper helps you communicate effectively with difficult or high-conflict individuals using proven psychological techniques.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    🪨 Grey Rock Method
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Emotionally neutral, brief, and factual responses. Like a boring grey rock, you become uninteresting to manipulative individuals by refusing to provide emotional reactions.
                  </p>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    💛 Yellow Rock Method
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Grey rock with a touch of politeness. Perfect for co-parenting or situations where communications might be reviewed by courts or mediators. Maintains boundaries while appearing cooperative.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-semibold text-blue-900 mb-3">
                  How to use:
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside font-medium">
                  <li>Paste the message you need to respond to</li>
                  <li>Click "Analyze Message"</li>
                  <li>See what makes it emotional</li>
                  <li>Choose grey or yellow rock version</li>
                  <li>Copy and use in your response</li>
                </ol>
              </div>

              <p className="text-xs text-slate-400 italic text-center">
                Note: Your messages are processed using AI and saved only in your browser. Nothing is stored on our servers.
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleClose}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
