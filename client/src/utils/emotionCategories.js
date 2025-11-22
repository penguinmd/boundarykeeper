// Categorize emotions by intensity for color coding
const STRONG_NEGATIVE = [
  'anger', 'rage', 'fury', 'hostility', 'aggression', 'hatred',
  'manipulation', 'blame', 'guilt', 'shame', 'contempt',
  'accusation', 'attack', 'threatening', 'intimidation',
  'controlling', 'coercion', 'gaslighting'
];

const MODERATE_CONCERN = [
  'defensive', 'defensiveness', 'passive-aggressive',
  'assumption', 'presumption', 'demand', 'pressure',
  'expectation', 'entitlement', 'frustration',
  'annoyance', 'irritation', 'sarcasm', 'condescension'
];

export function categorizeEmotion(reason, emotionText) {
  const lowerReason = reason?.toLowerCase() || '';
  const lowerText = emotionText?.toLowerCase() || '';
  const combined = `${lowerReason} ${lowerText}`;

  // Check for strong negative emotions
  if (STRONG_NEGATIVE.some(emotion => combined.includes(emotion))) {
    return 'strong';
  }

  // Check for moderate concerns
  if (MODERATE_CONCERN.some(emotion => combined.includes(emotion))) {
    return 'moderate';
  }

  // Default to moderate for any detected emotion
  return 'moderate';
}

export function getEmotionColors(category) {
  const colors = {
    strong: {
      bg: 'bg-red-100',
      text: 'text-red-900',
      border: 'border-red-400',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800'
    },
    moderate: {
      bg: 'bg-orange-100',
      text: 'text-orange-900',
      border: 'border-orange-400',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800'
    }
  };

  return colors[category] || colors.moderate;
}
