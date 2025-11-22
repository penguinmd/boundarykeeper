import EmotionalSummary from './EmotionalSummary';
import EmotionalHighlighter from './EmotionalHighlighter';
import VersionCard from './VersionCard';

export default function AnalysisResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 mt-8">
      <EmotionalSummary emotions={result.emotions} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Original Text with Highlights */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">
            Original Message
          </h3>
          <EmotionalHighlighter
            text={result.original}
            highlights={result.emotions?.highlights}
          />
          <p className="text-xs text-gray-500 mt-3 italic">
            Hover over highlighted text to see why it's flagged
          </p>
        </div>

        {/* Grey Rock */}
        <VersionCard
          title="Grey Rock Version"
          text={result.greyRock?.text}
          explanation={result.greyRock?.explanation}
          variant="grey"
        />

        {/* Yellow Rock */}
        <VersionCard
          title="Yellow Rock Version"
          text={result.yellowRock?.text}
          explanation={result.yellowRock?.explanation}
          variant="yellow"
        />
      </div>
    </div>
  );
}
