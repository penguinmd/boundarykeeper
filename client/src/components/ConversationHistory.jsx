import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getConversations, clearConversations } from '../utils/storage';

export default function ConversationHistory({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

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
    toast.success('Conversation loaded');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const truncate = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No recent conversations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-medium text-slate-500">
          {conversations.length} saved
        </span>
        <button
          onClick={handleClear}
          className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {conversations.map(convo => (
          <button
            key={convo.id}
            onClick={() => handleSelect(convo)}
            className="group text-left p-4 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col h-full justify-between gap-3">
              <p className="text-sm text-slate-700 font-medium line-clamp-2 group-hover:text-blue-900 transition-colors">
                "{truncate(convo.original)}"
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400">
                <span>{formatDate(convo.timestamp)}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Load →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
