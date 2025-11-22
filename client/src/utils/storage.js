import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'boundarykeeper_conversations';
const MAX_CONVERSATIONS = 50;

export function saveConversation(result) {
  try {
    const conversations = getConversations();

    const conversation = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...result
    };

    // Add to beginning of array
    conversations.unshift(conversation);

    // Keep only MAX_CONVERSATIONS
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    return conversation;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return null;
  }
}

export function getConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function clearConversations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear conversations:', error);
    return false;
  }
}

export function getConversationById(id) {
  const conversations = getConversations();
  return conversations.find(c => c.id === id);
}
