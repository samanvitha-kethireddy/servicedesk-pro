import { useState } from 'react';
import { ASSET_CATEGORY_LIST, ASSET_CONDITION_LIST } from '../../utils/constants';

const AssetForm = ({ initialData, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    manufacturer: initialData?.manufacturer || '',
    modelNumber: initialData?.modelNumber || '',
    serialNumber: initialData?.serialNumber || '',
    condition: initialData?.condition || 'New',
    purchaseCost: initialData?.purchaseCost || '',
    vendor: initialData?.vendor || '',
    location: initialData?.location || '',
    purchaseDate: initialData?.purchaseDate?.slice(0, 10) || '',
    warrantyExpiresAt: initialData?.warrantyExpiresAt?.slice(0, 10) || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Asset Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="label-text">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Select category</option>
            {ASSET_CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Manufacturer</label>
          <input name="manufacturer" value={form.manufacturer} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-text">Model Number</label>
          <input name="modelNumber" value={form.modelNumber} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Serial Number</label>
          <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-text">Condition</label>
          <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
            {ASSET_CONDITION_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Purchase Cost</label>
          <input type="number" name="purchaseCost" value={form.purchaseCost} onChange={handleChange} className="input-field" min="0" />
        </div>
        <div>
          <label className="label-text">Vendor</label>
          <input name="vendor" value={form.vendor} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Purchase Date</label>
          <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-text">Warranty Expires</label>
          <input type="date" name="warrantyExpiresAt" value={form.warrantyExpiresAt} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-text">Location</label>
        <input name="location" value={form.location} onChange={handleChange} className="input-field" />
      </div>

      <div>
        <label className="label-text">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-field" />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Saving...' : initialData ? 'Update Asset' : 'Create Asset'}
      </button>
    </form>
  );
};

export default AssetForm;