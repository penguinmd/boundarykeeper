export default function EmotionalHighlighter({ text, highlights }) {
  if (!highlights || highlights.length === 0) {
    return <p className="text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

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

    // Add highlighted text
    segments.push({
      type: 'highlight',
      content: text.slice(highlight.start, highlight.end),
      reason: highlight.reason,
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
              className="bg-red-100 text-red-900 px-1 rounded cursor-help border-b-2 border-red-300"
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
