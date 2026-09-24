import { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { timeAgo } from '../../utils/dateHelpers';

const TicketCommentBox = ({ comments, onAddComment, submitting }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const canPostInternal = user?.role !== ROLES.EMPLOYEE;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onAddComment(message, isInternal);
    setMessage('');
    setIsInternal(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet</p>}
        {comments.map((c) => (
          <div key={c._id} className={`p-3 rounded-lg ${c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">
                {c.author?.firstName} {c.author?.lastName}
                {c.isInternal && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600">
                    <Lock size={10} /> Internal
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-gray-200 pt-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="input-field"
          placeholder="Write a comment..."
        />
        <div className="flex items-center justify-between">
          {canPostInternal ? (
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              Internal note (not visible to requester)
            </label>
          ) : <span />}
          <button type="submit" disabled={submitting || !message.trim()} className="btn-primary text-sm">
            <Send size={14} className="mr-1.5" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCommentBox;