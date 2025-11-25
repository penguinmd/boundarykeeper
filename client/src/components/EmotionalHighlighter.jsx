import { processHighlights } from '../utils/textHighlight';
import { categorizeEmotion, getEmotionColors } from '../utils/emotionCategories';

export default function EmotionalHighlighter({ text, highlights }) {
  if (!highlights || highlights.length === 0) {
    return <p className="text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  // Process highlights to avoid splitting words and merge overlaps
  // Sort highlights by start position (processHighlights returns a new array, no need to copy)
  const sortedHighlights = processHighlights(text, highlights).sort((a, b) => a.start - b.start);

  // Build array of text segments
  const segments = [];
  let currentIndex = 0;

  sortedHighlights.forEach((highlight, idx) => {
    // Add text before highlight
    if (currentIndex < highlight.start) {
      segments.push({
        type: 'text',
        content: text.slice(currentIndex, highlight.start),
        key: `text-${idx}`
      });
    }

    // Get the highlighted text
    const highlightedText = text.slice(highlight.start, highlight.end);

    // Categorize emotion and get colors
    const category = categorizeEmotion(highlight.reason, highlightedText);
    const colors = getEmotionColors(category);

    // Add highlighted text
    segments.push({
      type: 'highlight',
      content: highlightedText,
      reason: highlight.reason,
      colors,
      key: `highlight-${idx}`
    });

    currentIndex = highlight.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(currentIndex),
      key: 'text-final'
    });
  }

  return (
    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
      {segments.map(segment => {
        if (segment.type === 'highlight') {
          return (
            <span
              key={segment.key}
              className={`${segment.colors.bg} ${segment.colors.text} px-1 rounded cursor-help border-b-2 ${segment.colors.border}`}
              title={segment.reason}
            >
              {segment.content}
            </span>
          );
        }
        return <span key={segment.key}>{segment.content}</span>;
      })}
    </p>
  );
}
