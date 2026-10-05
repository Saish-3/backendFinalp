import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import EquipmentForm from '../components/EquipmentForm';
import {
  ShieldCheck,
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals' or 'catalog'
  const [rentals, setRentals] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Equipment Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return Rental action state
  const [returningId, setReturningId] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (overdueOnly) {
        params.overdue = 'true';
      }
      const res = await axiosInstance.get('/rentals', { params });
      if (res.data.success) {
        setRentals(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  }, [overdueOnly, showError]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/equipment');
      if (res.data.success) {
        setEquipmentList(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch equipment catalog');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (activeTab === 'rentals') {
      fetchRentals();
    } else {
      fetchCatalog();
    }
  }, [activeTab, fetchRentals, fetchCatalog]);

  const handleMarkReturned = async (rentalId) => {
    setReturningId(rentalId);
    try {
      const res = await axiosInstance.post(`/rentals/${rentalId}/return`);
      if (res.data.success) {
        showSuccess('Equipment marked as returned and restored to inventory');
        fetchRentals();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to mark rental as returned');
    } finally {
      setReturningId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const res = await axiosInstance.put(`/equipment/${editingItem._id}`, formData);
        if (res.data.success) {
          showSuccess('Equipment updated successfully');
          setIsFormModalOpen(false);
          fetchCatalog();
        }
      } else {
        const res = await axiosInstance.post('/equipment', formData);
        if (res.data.success) {
          showSuccess('Equipment added successfully');
          setIsFormModalOpen(false);
          fetchCatalog();
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
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
        fetchCatalog();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Cannot delete item with active rentals');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
            <span>Admin Management Center</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Manage sports gear catalog and process customer returns
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-md)', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('rentals')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'rentals' ? '#ffffff' : 'transparent',
              color: activeTab === 'rentals' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'rentals' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <RotateCcw size={15} />
            <span>All Rentals & Returns</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'catalog' ? '#ffffff' : 'transparent',
              color: activeTab === 'catalog' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'catalog' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Package size={15} />
            <span>Catalog Management</span>
          </button>
        </div>
      </div>

      {/* RENTALS TAB */}
      {activeTab === 'rentals' && (
        <div>
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                id="overdueToggle"
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--danger)', cursor: 'pointer' }}
              />
              <label
                htmlFor="overdueToggle"
                style={{ fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                <span>Show Overdue Rentals Only</span>
              </label>
            </div>

            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing <strong>{rentals.length}</strong> rental records
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading all rental records..." />
          ) : rentals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Layers size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
              <h3>No rental records found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {overdueOnly ? 'Great news! There are currently no overdue equipment rentals.' : 'No rental records exist.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Member</th>
                    <th>Rented At</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => {
                    const isOverdue = rental.isOverdue;
                    return (
                      <tr
                        key={rental._id}
                        className={isOverdue ? 'row-overdue' : ''}
                      >
                        <td>
                          <div style={{ fontWeight: 600 }}>{rental.equipment?.name || 'Deleted Equipment'}</div>
                          <div style={{ fontSize: '0.75rem', color: isOverdue ? '#b91c1c' : 'var(--text-muted)' }}>
                            {rental.equipment?.category}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{rental.member?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: isOverdue ? '#b91c1c' : 'var(--text-muted)' }}>
                            {rental.member?.email}
                          </div>
                        </td>
                        <td>{formatDate(rental.rentedAt)}</td>
                        <td>
                          <div style={{ fontWeight: isOverdue ? 700 : 500 }}>
                            {formatDate(rental.dueDate)}
                          </div>
                        </td>
                        <td>
                          {rental.status === 'returned' ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Returned
                            </span>
                          ) : isOverdue ? (
                            <span className="badge badge-danger">
                              <AlertTriangle size={12} /> Overdue
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              <Clock size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td>
                          {rental.status === 'active' ? (
                            <button
                              onClick={() => handleMarkReturned(rental._id)}
                              className="btn btn-success btn-sm"
                              disabled={returningId === rental._id}
                            >
                              <RotateCcw size={14} />
                              <span>{returningId === rental._id ? 'Processing...' : 'Mark Returned'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              Returned on {formatDate(rental.returnedAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Equipment Inventory</h2>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} />
              <span>Add New Equipment</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading catalog..." />
          ) : equipmentList.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Package size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
              <h3>Catalog is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add some gear to begin renting to members.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                        {item.description || '—'}
                      </td>
                      <td>
                        {item.available ? (
                          <span className="badge badge-success">Available</span>
                        ) : (
                          <span className="badge badge-warning">Rented</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn btn-secondary btn-sm"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(item)}
                            className="btn btn-danger btn-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        title="Confirm Delete"
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
        <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Deleting will fail if this equipment is associated with an active rental.
        </p>
      </Modal>
    </div>
  );
};

export default AdminPanel;
