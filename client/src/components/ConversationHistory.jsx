import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getConversations, clearConversations } from '../utils/storage';

export default function ConversationHistory({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const data = getConversations();
    setConversations(data);
  };

  const handleClear = () => {
    if (window.confirm('Clear all conversation history?')) {
      const success = clearConversations();
      if (success) {
        setConversations([]);
        toast.success('History cleared');
      } else {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleSelect = (conversation) => {
    onSelectConversation(conversation);
    setIsOpen(false);
    toast.success('Conversation loaded');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncate = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
      >
        📜 History ({conversations.length})
      </button>

      {isOpen && (
        <div className="card mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Recent Conversations
            </h3>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => handleSelect(convo)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {truncate(convo.original)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(convo.timestamp)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
