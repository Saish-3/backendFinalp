import React, { useState, useEffect } from 'react';

const EquipmentForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    available: true
  });

  const categories = [
    'Cycling',
    'Water Sports',
    'Winter Sports',
    'Racquet Sports',
    'Camping',
    'Golf',
    'Hiking & Trekking',
    'Fitness',
    'Team Sports',
    'Other'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        available: initialData.available !== undefined ? initialData.available : true
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        available: true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="name">
          Equipment Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="form-control"
          placeholder="e.g. Trek Marlin 7 Mountain Bike"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">
          Category *
        </label>
        <select
          id="category"
          name="category"
          required
          className="form-control"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="form-control"
          placeholder="Brief description of condition, specs, sizing..."
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {initialData && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <input
            id="available"
            name="available"
            type="checkbox"
            style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
            checked={formData.available}
            onChange={handleChange}
          />
          <label htmlFor="available" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Mark as Available for Rent
          </label>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : initialData
            ? 'Update Equipment'
            : 'Add Equipment'}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;
