import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit, Trash2, Reply, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Comment, 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  formatCommentDate,
  extractMentions 
} from '@/services/commentsService';
import { useAuthStore } from '@/store/authStore';

interface CommentsSectionProps {
  taskId?: string;
  projectId?: string;
  onCommentAdded?: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  taskId, 
  projectId, 
  onCommentAdded 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    loadComments();
  }, [taskId, projectId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(taskId, projectId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await createComment({
        content: newComment,
        taskId,
        projectId
      });
      
      setNewComment('');
      await loadComments();
      onCommentAdded?.();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to create comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    try {
      setSubmitting(true);
      await createComment({
        content: replyContent,
        taskId,
        projectId,
        parentId: replyingTo
      });
      
      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      onCommentAdded?.();
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Failed to create reply:', error);
      toast.error('Failed to create reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await updateComment(commentId, { content: editContent });
      
      setEditingComment(null);
      setEditContent('');
      await loadComments();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      await loadComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const renderComment = (comment: Comment, level = 0) => {
    const isOwner = comment.user.id === user?.id;
    const mentions = extractMentions(comment.content);

    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{comment.user.name}</div>
                <div className="text-sm text-gray-500">{formatCommentDate(comment.createdAt)}</div>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startEditing(comment)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComment === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={submitting}
                  className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap">
              {comment.content.split(' ').map((word, index) => {
                if (word.startsWith('@') && mentions.includes(word.substring(1))) {
                  return (
                    <span key={index} className="text-primary-600 font-medium">
                      {word}{' '}
                    </span>
                  );
                }
                return word + ' ';
              })}
            </div>
          )}

          {/* Comment Actions */}
          {editingComment !== comment.id && (
            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={() => startReply(comment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm">Reply</span>
              </button>
            </div>
          )}

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4 space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting}
                  className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  onClick={cancelReply}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render Replies */}
        {comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Write a comment... Use @username to mention someone"
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Press Enter to submit, Shift+Enter for new line
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsSection; 