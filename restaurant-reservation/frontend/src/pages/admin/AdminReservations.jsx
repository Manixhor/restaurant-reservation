import { useState, useEffect } from 'react';
import { reservationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const TIME_SLOTS = ['11:00', '12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const { addToast } = useToast();
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;

  const loadReservations = (date = '', search = '') => {
    setLoading(true);
    const params = {};
    if (date) params.date = date;
    if (search) params.search = search;
    reservationsAPI.getAll(params)
      .then((res) => setReservations(res.data.reservations))
      .catch(() => setError('Failed to load reservations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReservations(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadReservations(dateFilter, searchQuery);
  };

  const clearFilters = () => {
    setDateFilter('');
    setSearchQuery('');
    loadReservations('', '');
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await reservationsAPI.cancel(cancelTarget._id);
      addToast('Reservation cancelled.', 'info');
      loadReservations(dateFilter, searchQuery);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancelTarget(null);
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({
      date: r.date,
      timeSlot: r.timeSlot,
      numberOfGuests: r.numberOfGuests,
      status: r.status,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await reservationsAPI.update(id, editForm);
      setEditingId(null);
      addToast('Reservation updated.', 'success');
      loadReservations(dateFilter, searchQuery);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    }
  };

  return (
    <div className="page-card">
      <div className="page-header admin-header">
        <span className="eyebrow">Admin control</span>
        <h1>All Reservations</h1>
        <p>Filter by service date, search guests, update booking details, and cancel reservations.</p>
      </div>
      {error && <div className="error">{error}</div>}

      {!loading && (
        <div className="summary-strip admin-summary" aria-label="Reservation summary">
          <div>
            <span>Total</span>
            <strong>{reservations.length}</strong>
          </div>
          <div>
            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>
          <div>
            <span>Cancelled</span>
            <strong>{cancelledCount}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleFilter} className="filter-bar">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." />
        <button type="submit" className="btn btn-sm btn-primary">Search</button>
        {(dateFilter || searchQuery) && (
          <button type="button" className="btn btn-sm" onClick={clearFilters}>Clear</button>
        )}
      </form>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : reservations.length === 0 ? (
        <div className="empty-state"><p>No reservations found.</p></div>
      ) : (
        <div className="reservation-list">
          {reservations.map((r) => (
            <div key={r._id} className={`reservation-card ${r.status}`}>
              {editingId === r._id ? (
                <div className="edit-form">
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                  <select value={editForm.timeSlot} onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}>
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" value={editForm.numberOfGuests} min={1} onChange={(e) => setEditForm({ ...editForm, numberOfGuests: Number(e.target.value) })} />
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(r._id)}>Save</button>
                  <button className="btn btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="reservation-main">
                    <span className="res-user">{r.user?.name || 'Unknown guest'}<span className="res-email">{r.user?.email || 'No email'}</span></span>
                    <span className="res-date">{r.date}</span>
                    <span className="res-time">{r.timeSlot}</span>
                    <span className="res-guests">{r.numberOfGuests} {r.numberOfGuests === 1 ? 'guest' : 'guests'}</span>
                    {r.table && <span className="res-table">Table {r.table.tableNumber}</span>}
                  </div>
                  <div className="reservation-actions">
                    <span className={`status-badge ${r.status}`}>{r.status}</span>
                    <button className="btn btn-sm" onClick={() => startEdit(r)}>Edit</button>
                    {r.status === 'confirmed' && (
                      <button className="btn btn-sm btn-danger" onClick={() => setCancelTarget(r)}>Cancel</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Reservation"
          message={`Cancel reservation for ${cancelTarget.user?.name} on ${cancelTarget.date} at ${cancelTarget.timeSlot}?`}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelTarget(null)}
          confirmText="Yes, Cancel"
          danger
        />
      )}
    </div>
  );
}
