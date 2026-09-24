import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { userApi } from '../api/userApi';
import { departmentApi } from '../api/departmentApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { ROLES_LIST } from '../utils/constants';

const UserManagementPage = () => {
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: '', department: '' });

  const { data, loading, refetch } = useFetch(() => userApi.getAll({ page, limit: 15 }), [page]);
  const { data: departments } = useFetch(() => departmentApi.getAll(), []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.create(form);
      toast.success('User created');
      setCreateModalOpen(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: '', department: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.isActive) {
        await userApi.deactivate(user._id);
        toast.success('User deactivated');
      } else {
        await userApi.reactivate(user._id);
        toast.success('User reactivated');
      }
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department', render: (u) => u.department?.name || '—' },
    { key: 'status', label: 'Status', render: (u) => <Badge label={u.isActive ? 'Active' : 'Inactive'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <button onClick={() => handleToggleActive(u)} className="text-xs text-primary-600 font-medium">
          {u.isActive ? 'Deactivate' : 'Reactivate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
        <button onClick={() => setCreateModalOpen(true)} className="btn-primary text-sm">
          <Plus size={16} className="mr-1.5" />
          New User
        </button>
      </div>

      <DataTable columns={columns} data={data} loading={loading} />

      <div className="flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm">Previous</button>
        <span className="text-sm text-gray-600 self-center">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Next</button>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create User" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">First Name</label>
              <input name="firstName" required value={form.firstName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label-text">Last Name</label>
              <input name="lastName" required value={form.lastName} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-text">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input type="password" name="password" required minLength={8} value={form.password} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Role</label>
            <select name="role" required value={form.role} onChange={handleChange} className="input-field">
              <option value="">Select role</option>
              {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Department</label>
            <select name="department" required value={form.department} onChange={handleChange} className="input-field">
              <option value="">Select department</option>
              {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;