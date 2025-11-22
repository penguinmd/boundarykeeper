// Expand highlight boundaries to word boundaries to avoid splitting words
export function expandToWordBoundaries(text, start, end) {
  // Find the start of the word (move backwards to non-letter character)
  let wordStart = start;
  while (wordStart > 0 && /[a-zA-Z]/.test(text[wordStart - 1])) {
    wordStart--;
  }

  // Find the end of the word (move forward to non-letter character)
  let wordEnd = end;
  while (wordEnd < text.length && /[a-zA-Z]/.test(text[wordEnd])) {
    wordEnd++;
  }

  return { start: wordStart, end: wordEnd };
}

// Process highlights to ensure they don't split words
export function processHighlights(text, highlights) {
  if (!highlights || highlights.length === 0) {
    return [];
  }

  // Expand each highlight to word boundaries
  const expandedHighlights = highlights.map(highlight => {
    const { start, end } = expandToWordBoundaries(text, highlight.start, highlight.end);
    return {
      ...highlight,
      start,
      end
    };
  });

  // Merge overlapping highlights
  const merged = [];
  let current = expandedHighlights[0];

  for (let i = 1; i < expandedHighlights.length; i++) {
    const next = expandedHighlights[i];

    if (next.start <= current.end) {
      // Overlapping - merge them
      current = {
        ...current,
        end: Math.max(current.end, next.end),
        reason: `${current.reason}; ${next.reason}`
      };
    } else {
      // No overlap - save current and move to next
      merged.push(current);
      current = next;
    }
  }

  // Don't forget the last one
  merged.push(current);

  return merged;
}
