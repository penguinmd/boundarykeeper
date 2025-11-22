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
    <div className="space-y-6 mt-8">
      {results.map((modelResult, index) => {
        // Skip if this result has an error
        if (modelResult.error) {
          return (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">
                {modelResult.displayName || modelResult.modelId || 'Model'} - Error
              </h3>
              <p className="text-sm text-red-700">{modelResult.error}</p>
            </div>
          );
        }

        return (
          <div key={index} className="space-y-4">
            {/* Model header - only show if multiple models */}
            {hasMultipleResults && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {modelResult.displayName || modelResult.modelId}
                </h2>
                <p className="text-sm text-gray-600">
                  Provider: {modelResult.provider} • Model: {modelResult.model}
                </p>
              </div>
            )}

            {/* Emotional Summary */}
            <EmotionalSummary emotions={modelResult.emotions} />

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Original Text with Highlights - show for each model */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Original Message
                </h3>
                <EmotionalHighlighter
                  text={originalText}
                  highlights={modelResult.emotions?.highlights}
                />
                <p className="text-xs text-gray-500 mt-3 italic">
                  Hover over highlighted text to see why it's flagged
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
              <hr className="my-8 border-t-2 border-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
