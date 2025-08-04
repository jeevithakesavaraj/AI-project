import axios from 'axios';

// Types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  taskId?: string;
  projectId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  replies: Comment[];
}

export interface CreateCommentData {
  content: string;
  taskId?: string;
  projectId?: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

// API functions
export const getComments = async (taskId?: string, projectId?: string): Promise<Comment[]> => {
  try {
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (projectId) params.append('projectId', projectId);

    const response = await axios.get(`/api/comments?${params.toString()}`);
    return response.data.data.comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error;
  }
};

export const createComment = async (data: CreateCommentData): Promise<Comment> => {
  try {
    const response = await axios.post('/api/comments', data);
    return response.data.data.comment;
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw error;
  }
};

export const updateComment = async (commentId: string, data: UpdateCommentData): Promise<Comment> => {
  try {
    const response = await axios.put(`/api/comments/${commentId}`, data);
    return response.data.data.comment;
  } catch (error) {
    console.error('Failed to update comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await axios.delete(`/api/comments/${commentId}`);
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
};

// Utility functions
export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

export default {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  formatCommentDate,
  extractMentions
}; 