import { useState, useEffect } from 'react';
import { reservationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    reservationsAPI.getMine()
      .then((res) => setReservations(res.data.reservations))
      .catch(() => setError('Failed to load reservations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await reservationsAPI.cancelMine(cancelTarget._id);
      setReservations((prev) =>
        prev.map((r) => (r._id === cancelTarget._id ? { ...r, status: 'cancelled' } : r))
      );
      addToast('Reservation cancelled.', 'info');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancelTarget(null);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page-card">
      <div className="page-header">
        <span className="eyebrow">Customer view</span>
        <h1>My Reservations</h1>
        <p>Review your bookings and cancel confirmed reservations when needed.</p>
      </div>
      {error && <div className="error">{error}</div>}
      {reservations.length === 0 ? (
        <div className="empty-state"><p>No reservations found.</p></div>
      ) : (
        <div className="reservation-list">
          {reservations.map((r) => (
            <div key={r._id} className={`reservation-card ${r.status}`}>
              <div className="reservation-main">
                <span className="res-date">{r.date}</span>
                <span className="res-time">{r.timeSlot}</span>
                <span className="res-guests">{r.numberOfGuests} {r.numberOfGuests === 1 ? 'guest' : 'guests'}</span>
                {r.table && <span className="res-table">Table {r.table.tableNumber} ({r.table.capacity} seats, {r.table.location})</span>}
              </div>
              <div className="reservation-actions">
                <span className={`status-badge ${r.status}`}>{r.status}</span>
                {r.status === 'confirmed' && (
                  <button className="btn btn-sm btn-danger" onClick={() => setCancelTarget(r)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Reservation"
          message={`Cancel your reservation on ${cancelTarget.date} at ${cancelTarget.timeSlot} for ${cancelTarget.numberOfGuests} guests?`}
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          confirmText="Yes, Cancel"
          danger
        />
      )}
    </div>
  );
}
