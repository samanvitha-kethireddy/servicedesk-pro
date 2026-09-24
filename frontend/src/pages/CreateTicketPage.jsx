import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketApi } from '../api/ticketApi';
import TicketForm from '../components/tickets/TicketForm';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await ticketApi.create(formData);
      toast.success(`Ticket ${data.data.ticket.ticketCode} created`);
      navigate(`/tickets/${data.data.ticket._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Create New Ticket</h1>
      <div className="card">
        <TicketForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default CreateTicketPage;