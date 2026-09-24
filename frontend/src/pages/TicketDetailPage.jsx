import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { ticketApi } from '../api/ticketApi';
import { userApi } from '../api/userApi';
import TicketDetail from '../components/tickets/TicketDetail';
import TicketCommentBox from '../components/tickets/TicketCommentBox';
import Loader from '../components/common/Loader';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(() => ticketApi.getById(id), [id]);
  const [comments, setComments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const fetchComments = async () => {
    const { data } = await ticketApi.getComments(id);
    setComments(data.data.comments);
  };

  useEffect(() => {
    fetchComments();
    userApi.getTechnicians().then(({ data }) => setTechnicians(data.data.technicians)).catch(() => {});
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await ticketApi.changeStatus(id, status);
      toast.success(`Status changed to ${status}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleAssign = async (assignedTo) => {
    try {
      await ticketApi.assign(id, assignedTo);
      toast.success('Ticket assigned');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleToggleWatch = async () => {
    await ticketApi.toggleWatch(id);
    refetch();
  };

  const handleAddComment = async (message, isInternal) => {
    setCommentSubmitting(true);
    try {
      await ticketApi.addComment(id, message, isInternal);
      fetchComments();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading || !data) return <Loader fullScreen />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TicketDetail
          ticket={data.ticket}
          technicians={technicians}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onToggleWatch={handleToggleWatch}
        />
      </div>
      <div className="card h-fit">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Comments</h3>
        <TicketCommentBox comments={comments} onAddComment={handleAddComment} submitting={commentSubmitting} />
      </div>
    </div>
  );
};

export default TicketDetailPage;