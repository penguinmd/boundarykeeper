import EmotionalSummary from './EmotionalSummary';
import EmotionalHighlighter from './EmotionalHighlighter';
import VersionCard from './VersionCard';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  // Handle both old format (single result) and new format (multiple results)
  const hasMultipleResults = result.results && Array.isArray(result.results);
  const results = hasMultipleResults ? result.results : [result];
  const originalText = result.original || '';

  return (
    <div className="space-y-12 animate-fade-in">
      {results.map((modelResult, index) => {
        // Skip if this result has an error
        if (modelResult.error) {
          return (
            <div key={index} className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {modelResult.displayName || modelResult.modelId || 'Model'} - Error
              </h3>
              <p className="text-sm text-red-700">{modelResult.error}</p>
            </div>
          );
        }

        return (
          <div key={index} className="space-y-8">
            {/* Model header - only show if multiple models */}
            {hasMultipleResults && (
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {modelResult.displayName || modelResult.modelId}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {modelResult.provider}
                  </p>
                </div>
              </div>
            )}

            {/* Emotional Summary */}
            <EmotionalSummary emotions={modelResult.emotions} />

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Original Text with Highlights */}
              <div className="card h-full flex flex-col">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Original Message
                </h3>
                <div className="flex-grow">
                  <EmotionalHighlighter
                    text={originalText}
                    highlights={modelResult.emotions?.highlights}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                  Hover over highlighted text to see analysis
                </p>
              </div>

              {/* Grey Rock */}
              <VersionCard
                title="Grey Rock Version"
                text={modelResult.greyRock?.text}
                explanation={modelResult.greyRock?.explanation}
                variant="grey"
              />

              {/* Yellow Rock */}
              <VersionCard
                title="Yellow Rock Version"
                text={modelResult.yellowRock?.text}
                explanation={modelResult.yellowRock?.explanation}
                variant="yellow"
              />
            </div>

            {/* Separator between models */}
            {hasMultipleResults && index < results.length - 1 && (
              <div className="w-full h-px bg-slate-200 my-12"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
