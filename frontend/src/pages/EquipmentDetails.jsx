import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Tag,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/equipment/${id}`);
        if (res.data.success) {
          setEquipment(res.data.data);
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, showError]);

  // Compute preview due date based on selected days
  const previewDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const handleRent = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError('Please sign in to rent equipment');
      navigate('/login', { state: { from: { pathname: `/equipment/${id}` } } });
      return;
    }

    if (days < 1 || days > 14) {
      showError('Rental duration must be between 1 and 14 days');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post('/rentals', {
        equipmentId: id,
        days: parseInt(days, 10)
      });

      if (res.data.success) {
        showSuccess('Equipment rented successfully! Check your rentals list.');
        navigate('/my-rentals');
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
        'Could not complete rental request.';
      showError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading gear details..." />;
  }

  if (!equipment) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h2>Equipment not found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The requested equipment item does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Catalog</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Equipment Details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {equipment.category}
            </span>

            {equipment.available ? (
              <span className="badge badge-success">
                <CheckCircle2 size={13} /> Available
              </span>
            ) : (
              <span className="badge badge-warning">
                <XCircle size={13} /> Currently Rented
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.25 }}>
            {equipment.name}
          </h1>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Product Specifications & Details
            </h4>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              {equipment.description || 'No detailed specifications provided for this item.'}
            </p>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}
          >
            <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <strong>Rental Policy:</strong> Equipment can be rented for a duration of 1 to 14 days.
              Returns must be made by the due date. Admin verification is required upon return.
            </div>
          </div>
        </div>

        {/* Right Column: Rent Action Box */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Rent This Equipment
          </h2>

          {equipment.available ? (
            <form onSubmit={handleRent}>
              <div className="form-group">
                <label className="form-label" htmlFor="days">
                  Rental Duration (Days): <strong>{days} {days === 1 ? 'day' : 'days'}</strong>
                </label>
                <input
                  id="days"
                  type="range"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', margin: '0.5rem 0' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>1 day (Min)</span>
                  <span>7 days</span>
                  <span>14 days (Max)</span>
                </div>
              </div>

              {/* Due date preview */}
              <div
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid #c7d2fe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Calendar size={18} />
                  <span>Computed Due Date</span>
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e1b4b', marginTop: '0.25rem' }}>
                  {previewDueDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4338ca', marginTop: '0.25rem' }}>
                  Must be returned by {previewDueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing Rental...' : `Confirm & Rent for ${days} Days`}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#fef2f2',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Item Currently Unavailable
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                This equipment is currently checked out by another member. Please check back later or choose another item.
              </p>
              <Link to="/" className="btn btn-secondary" style={{ width: '100%' }}>
                Browse Available Gear
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
