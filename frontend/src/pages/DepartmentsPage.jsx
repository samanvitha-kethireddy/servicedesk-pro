import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { departmentApi } from '../api/departmentApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const DepartmentsPage = () => {
  const { data, loading, refetch } = useFetch(() => departmentApi.getAll(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await departmentApi.create(form);
      toast.success('Department created');
      setModalOpen(false);
      setForm({ name: '', code: '', description: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status', render: (d) => <Badge label={d.isActive ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Departments</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <Plus size={16} className="mr-1.5" />
          New Department
        </button>
      </div>

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Department" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="e.g. Finance" />
          </div>
          <div>
            <label className="label-text">Code</label>
            <input name="code" required value={form.code} onChange={handleChange} className="input-field" placeholder="e.g. FIN" maxLength={10} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating...' : 'Create Department'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;