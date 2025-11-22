import { categorizeEmotion, getEmotionColors } from '../utils/emotionCategories';

export default function EmotionalSummary({ emotions }) {
  if (!emotions || !emotions.summary || emotions.summary.length === 0) {
    return null;
  }

  return (
    <div className="card bg-red-50 border-red-200">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Emotions Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {emotions.summary.map((emotion, index) => {
              const category = categorizeEmotion(emotion, emotion);
              const colors = getEmotionColors(category);

              return (
                <span
                  key={index}
                  className={`px-3 py-1 ${colors.badgeBg} ${colors.badgeText} rounded-full text-sm font-medium capitalize`}
                >
                  {emotion}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
