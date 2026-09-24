import { useState } from 'react';
import { TICKET_CATEGORY_LIST, KB_STATUS_LIST } from '../../utils/constants';

const KBForm = ({ initialData, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    status: initialData?.status || 'Draft',
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required minLength={5} className="input-field" />
      </div>

      <div>
        <label className="label-text">Summary</label>
        <input name="summary" value={form.summary} onChange={handleChange} maxLength={300} className="input-field" />
      </div>

      <div>
        <label className="label-text">Content</label>
        <textarea name="content" value={form.content} onChange={handleChange} required rows={8} className="input-field" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Select category</option>
            {TICKET_CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {KB_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label-text">Tags (comma separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="vpn, password-reset" />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Saving...' : initialData ? 'Update Article' : 'Create Article'}
      </button>
    </form>
  );
};

export default KBForm;