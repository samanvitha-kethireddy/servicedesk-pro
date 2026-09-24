import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { timeAgo } from '../../utils/dateHelpers';
import { CheckCheck } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.getAll(20)
      .then(({ data }) => setNotifications(data.data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = async (n) => {
    if (!n.isRead) await notificationApi.markAsRead(n._id);
    if (n.link) navigate(n.link);
    onClose();
  };

  const handleMarkAll = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</span>
          <button onClick={handleMarkAll} className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500 dark:text-gray-400 p-4">Loading...</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-4">No notifications</p>
        )}

        {notifications.map((n) => (
          <button
            key={n._id}
            onClick={() => handleClick(n)}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
          >
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{n.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
          </button>
        ))}
      </div>
    </>
  );
};

export default NotificationDropdown;