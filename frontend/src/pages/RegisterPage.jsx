import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', department: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Public departments list — falls back to empty if endpoint not permitted pre-auth
    axiosInstance.get('/departments').then(({ data }) => setDepartments(data.data || [])).catch(() => setDepartments([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary-700 text-center mb-1">{APP_NAME}</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="card space-y-4">
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
            <label className="label-text">Department</label>
            <select name="department" required value={form.department} onChange={handleChange} className="input-field">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label-text">Phone (optional)</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;