import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { kbApi } from '../api/kbApi';
import KBCard from '../components/kb/KBCard';
import KBForm from '../components/kb/KBForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { TICKET_CATEGORY_LIST } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const KnowledgeBasePage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => kbApi.getAll({ ...filters, page, limit: 12 }),
    [filters.category, filters.search, page]
  );

  const canCreate = [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER, ROLES.TECHNICIAN].includes(user?.role);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await kbApi.create(formData);
      toast.success('Article created');
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
        {canCreate && (
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary text-sm">
            <Plus size={16} className="mr-1.5" />
            New Article
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search articles..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input-field w-auto">
          <option value="">All Categories</option>
          {TICKET_CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((a) => <KBCard key={a._id} article={a} />)}
          </div>
          {data?.length === 0 && <p className="text-center text-sm text-gray-500 py-10">No articles found</p>}
        </>
      )}

      <div className="flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm">Previous</button>
        <span className="text-sm text-gray-600 self-center">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Next</button>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New KB Article" size="lg">
        <KBForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;