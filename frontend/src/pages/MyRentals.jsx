import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  ShoppingBag
} from 'lucide-react';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/rentals');
        if (res.data.success) {
          setRentals(res.data.data);
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to fetch rentals');
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [showError]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Rentals History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Track all your active and past sports equipment rentals
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your rental records..." />
      ) : rentals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No rentals yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            You haven't rented any equipment yet. Explore our catalog to find gear!
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Equipment Catalog
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Rented Date</th>
                <th>Due Date</th>
                <th>Returned Date</th>
                <th>Status</th>
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
                      <div style={{ fontWeight: 600 }}>{rental.equipment?.name || 'Unknown Item'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: '#f1f5f9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: '#475569',
                          fontWeight: 600
                        }}
                      >
                        {rental.equipment?.category || 'General'}
                      </span>
                    </td>
                    <td>{formatDate(rental.rentedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{formatDate(rental.dueDate)}</span>
                      </div>
                    </td>
                    <td>{formatDate(rental.returnedAt)}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
