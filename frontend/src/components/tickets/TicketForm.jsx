import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ticketApi } from '../../api/ticketApi';
import { TICKET_CATEGORY_LIST, TICKET_PRIORITY_LIST } from '../../utils/constants';
import toast from 'react-hot-toast';

const TicketForm = ({ onSubmit, submitting }) => {
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: '', tags: '' });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [classifying, setClassifying] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClassify = async () => {
    if (form.title.length < 5 || form.description.length < 10) {
      toast.error('Add a title and description first');
      return;
    }
    setClassifying(true);
    try {
      const { data } = await ticketApi.classifyPreview(form.title, form.description);
      if (data.data.suggestion) {
        setAiSuggestion(data.data.suggestion);
        setForm((prev) => ({
          ...prev,
          category: data.data.suggestion.suggestedCategory,
          priority: data.data.suggestion.suggestedPriority,
        }));
      } else {
        toast('AI classification unavailable, please select manually', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error('Classification failed');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          minLength={5}
          className="input-field"
          placeholder="Brief summary of the issue"
        />
      </div>

      <div>
        <label className="label-text">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          minLength={10}
          rows={4}
          className="input-field"
          placeholder="Describe the issue in detail"
        />
      </div>

      <button
        type="button"
        onClick={handleClassify}
        disabled={classifying}
        className="btn-secondary text-xs"
      >
        <Sparkles size={14} className="mr-1.5" />
        {classifying ? 'Classifying...' : 'Auto-classify with AI'}
      </button>

      {aiSuggestion && (
        <p className="text-xs text-gray-500">
          AI suggested: <strong>{aiSuggestion.suggestedCategory}</strong> / <strong>{aiSuggestion.suggestedPriority}</strong>
          {' '}(confidence: {Math.round(aiSuggestion.confidenceScore * 100)}%)
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Select category</option>
            {TICKET_CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} required className="input-field">
            <option value="">Select priority</option>
            {TICKET_PRIORITY_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label-text">Tags (comma separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="vpn, urgent" />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;