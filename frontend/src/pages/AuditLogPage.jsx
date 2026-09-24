import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import axiosInstance from '../api/axiosInstance';
import DataTable from '../components/common/DataTable';
import { formatDate } from '../utils/dateHelpers';

const AuditLogPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', entityType: '' });

  const { data, loading } = useFetch(
    () => axiosInstance.get('/audit-logs', { params: { ...filters, page, limit: 20 } }),
    [filters.action, filters.entityType, page]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'entityType', label: 'Entity' },
    { key: 'performedBy', label: 'Performed By', render: (l) => l.performedBy ? `${l.performedBy.firstName} ${l.performedBy.lastName}` : 'System' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Timestamp', render: (l) => formatDate(l.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>

      <div className="flex flex-wrap gap-3">
        <select value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)} className="input-field w-auto">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="ASSIGN">Assign</option>
          <option value="STATUS_CHANGE">Status Change</option>
          <option value="ESCALATE">Escalate</option>
        </select>
        <select value={filters.entityType} onChange={(e) => handleFilterChange('entityType', e.target.value)} className="input-field w-auto">
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Ticket">Ticket</option>
          <option value="Asset">Asset</option>
          <option value="KnowledgeBaseArticle">KB Article</option>
        </select>
      </div>

      <DataTable columns={columns} data={data} loading={loading} />

      <div className="flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm">Previous</button>
        <span className="text-sm text-gray-600 self-center">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Next</button>
      </div>
    </div>
  );
};

export default AuditLogPage;