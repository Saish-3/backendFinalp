import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import EquipmentForm from '../components/EquipmentForm';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin edit/create/delete modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAdmin, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (availabilityFilter !== '') params.available = availabilityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axiosInstance.get('/equipment', { params });
      if (res.data.success) {
        setEquipmentList(res.data.data);

        // Extract unique categories for filter dropdown if not set
        const cats = [...new Set(res.data.data.map((item) => item.category))];
        setCategories((prev) => (prev.length > 0 ? prev : cats));
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load equipment catalog');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, availabilityFilter, searchQuery, showError]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update
        const res = await axiosInstance.put(`/equipment/${editingItem._id}`, formData);
        if (res.data.success) {
          showSuccess('Equipment updated successfully');
          setIsFormModalOpen(false);
          fetchEquipment();
        }
      } else {
        // Create
        const res = await axiosInstance.post('/equipment', formData);
        if (res.data.success) {
          showSuccess('Equipment created successfully');
          setIsFormModalOpen(false);
          fetchEquipment();
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item, e) => {
    e.stopPropagation();
    setDeleteTarget(item);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosInstance.delete(`/equipment/${deleteTarget._id}`);
      if (res.data.success) {
        showSuccess('Equipment deleted successfully');
        setIsDeleting(false);
        setDeleteTarget(null);
        fetchEquipment();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Cannot delete equipment with active rentals');
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.3)'
        }}
      >
        <div style={{ maxWidth: '700px' }}>
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#a5b4fc',
              marginBottom: '0.5rem',
              display: 'inline-block'
            }}
          >
            Premium Sports Gear
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Rent High-Performance Equipment On Demand
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '1rem', lineHeight: 1.6 }}>
            Explore our curated inventory of kayaks, snowboards, mountain bikes, camping gear, and more. 
            Select your rental duration up to 14 days and hit your next adventure!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, minWidth: '280px' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search gear by name or category..."
              style={{ paddingLeft: '2.25rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="true">Available Now</option>
              <option value="false">Currently Rented</option>
            </select>
          </div>
        </div>

        {/* Admin Action */}
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={18} />
            <span>Add Equipment</span>
          </button>
        )}
      </div>

      {/* Equipment List Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching gear catalog..." />
      ) : equipmentList.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-muted)'
          }}
        >
          <Layers size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            No equipment found
          </h3>
          <p style={{ marginTop: '0.25rem' }}>
            Try adjusting your search query or filters to find what you need.
          </p>
          {(selectedCategory || availabilityFilter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setAvailabilityFilter('');
                setSearchQuery('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="equipment-grid">
          {equipmentList.map((item) => (
            <div
              key={item._id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {item.category}
                  </span>

                  {item.available ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Available
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      <XCircle size={12} /> Rented Out
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--text-main)'
                  }}
                >
                  {item.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem'
                  }}
                >
                  {item.description || 'Professional grade equipment maintained for optimal performance and safety.'}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {isAdmin ? (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => handleOpenEdit(item, e)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Item"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => confirmDelete(item, e)}
                        className="btn btn-danger btn-sm"
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <Link
                      to={`/equipment/${item._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={`/equipment/${item._id}`}
                    className={`btn ${item.available ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ width: '100%' }}
                  >
                    {item.available ? (
                      <>
                        <span>Rent Now</span>
                        <ArrowRight size={14} />
                      </>
                    ) : (
                      <span>View Details (Unavailable)</span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? 'Edit Equipment' : 'Add New Equipment'}
      >
        <EquipmentForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleting}
        onClose={() => {
          setIsDeleting(false);
          setDeleteTarget(null);
        }}
        title="Confirm Deletion"
        footer={
          <>
            <button
              onClick={() => {
                setIsDeleting(false);
                setDeleteTarget(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Equipment
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Note: You cannot delete equipment if it currently has an active rental.
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;
