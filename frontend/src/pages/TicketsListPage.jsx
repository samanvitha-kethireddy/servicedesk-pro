import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { ticketApi } from '../api/ticketApi';
import TicketCard from '../components/tickets/TicketCard';
import Loader from '../components/common/Loader';
import { TICKET_STATUS_LIST, TICKET_PRIORITY_LIST } from '../utils/constants';

const TicketsListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () => ticketApi.getAll({ ...filters, page, limit: 12 }),
    [filters.status, filters.priority, filters.search, page]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
        <button onClick={() => navigate('/tickets/new')} className="btn-primary text-sm">
          <Plus size={16} className="mr-1.5" />
          New Ticket
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          {TICKET_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input-field w-auto">
          <option value="">All Priorities</option>
          {TICKET_PRIORITY_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((t) => <TicketCard key={t._id} ticket={t} />)}
          </div>
          {data?.length === 0 && <p className="text-center text-sm text-gray-500 py-10">No tickets found</p>}
        </>
      )}

      <div className="flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm">Previous</button>
        <span className="text-sm text-gray-600 self-center">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Next</button>
      </div>
    </div>
  );
};

export default TicketsListPage;