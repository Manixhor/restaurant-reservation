import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const styles = {
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '2rem' },
  header: { marginBottom: '1.5rem' },
  title: { margin: '0 0 1rem 0' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'end' },
  input: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' },
  select: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#fff' },
  button: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ddd', color: '#555', fontSize: '0.85rem', textTransform: 'uppercase' },
  td: { padding: '0.75rem', borderBottom: '1px solid #eee', fontSize: '0.9rem' },
  badge: (status) => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    backgroundColor: status === 'confirmed' ? '#eafaf1' : status === 'cancelled' ? '#fdf0ef' : '#fef9e7',
    color: status === 'confirmed' ? '#27ae60' : status === 'cancelled' ? '#e74c3c' : '#f39c12',
  }),
  cancelBtn: { padding: '0.3rem 0.6rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  editBtn: { padding: '0.3rem 0.6rem', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.3rem' },
  loading: { textAlign: 'center', padding: '2rem', color: '#666' },
  error: { color: '#e74c3c', padding: '0.75rem', backgroundColor: '#fdf0ef', borderRadius: '4px', marginBottom: '1rem' },
  empty: { textAlign: 'center', color: '#999', padding: '3rem' },
  editForm: { backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'end' },
  stats: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: { padding: '1rem 1.5rem', backgroundColor: '#f0f0f0', borderRadius: '8px', textAlign: 'center', flex: '1', minWidth: '120px' },
  statNumber: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' },
};

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchReservations = async () => {
    try {
      setError('');
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const { data } = await adminAPI.getReservations(params);
      setReservations(data);
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchReservations();
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterStatus('');
    setLoading(true);
    setTimeout(() => fetchReservations(), 0);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await adminAPI.cancelReservation(id);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({
      date: r.date.split('T')[0],
      timeSlot: r.timeSlot,
      guests: r.guests,
      status: r.status,
    });
    setError('');
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await adminAPI.updateReservation(id, editForm);
      setEditingId(null);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    }
  };

  const totalGuests = reservations.reduce((sum, r) => sum + (r.status === 'confirmed' ? r.guests : 0), 0);
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  if (loading) return <div style={styles.loading}>Loading reservations...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Dashboard</h2>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{reservations.length}</div>
          <div style={styles.statLabel}>Total Reservations</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{confirmedCount}</div>
          <div style={styles.statLabel}>Confirmed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalGuests}</div>
          <div style={styles.statLabel}>Total Guests</div>
        </div>
      </div>

      <form onSubmit={handleFilter} style={styles.filters}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#555' }}>Date</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.input} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#555' }}>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button type="submit" style={styles.button}>Filter</button>
        <button type="button" onClick={clearFilters} style={{ ...styles.button, backgroundColor: '#666' }}>Clear</button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {reservations.length === 0 ? (
        <div style={styles.empty}>No reservations found.</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Guests</th>
              <th style={styles.th}>Table</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id}>
                {editingId === r._id ? (
                  <>
                    <td style={styles.td}>{r.user?.name}</td>
                    <td style={styles.td}>{r.user?.email}</td>
                    <td style={styles.td}>
                      <input type="date" value={editForm.date} onChange={(e) => handleEditChange('date', e.target.value)} style={{ ...styles.input, width: '130px' }} />
                    </td>
                    <td style={styles.td}>
                      <select value={editForm.timeSlot} onChange={(e) => handleEditChange('timeSlot', e.target.value)} style={styles.select}>
                        {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={editForm.guests} onChange={(e) => handleEditChange('guests', parseInt(e.target.value))} min="1" max="20" style={{ ...styles.input, width: '60px' }} />
                    </td>
                    <td style={styles.td}>#{r.table?.tableNumber}</td>
                    <td style={styles.td}>
                      <select value={editForm.status} onChange={(e) => handleEditChange('status', e.target.value)} style={styles.select}>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => saveEdit(r._id)} style={{ ...styles.editBtn, backgroundColor: '#27ae60' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ ...styles.cancelBtn, backgroundColor: '#666' }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={styles.td}>{r.user?.name}</td>
                    <td style={styles.td}>{r.user?.email}</td>
                    <td style={styles.td}>{new Date(r.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{r.timeSlot}</td>
                    <td style={styles.td}>{r.guests}</td>
                    <td style={styles.td}>#{r.table?.tableNumber} ({r.table?.capacity}pax)</td>
                    <td style={styles.td}><span style={styles.badge(r.status)}>{r.status}</span></td>
                    <td style={styles.td}>
                      <button onClick={() => startEdit(r)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleCancel(r._id)} style={styles.cancelBtn}>Cancel</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
