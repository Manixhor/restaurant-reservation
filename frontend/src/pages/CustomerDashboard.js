import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationsAPI } from '../api';

const styles = {
  container: { maxWidth: '800px', margin: '2rem auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  linkButton: { padding: '0.6rem 1.2rem', backgroundColor: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ddd', color: '#555', fontSize: '0.85rem', textTransform: 'uppercase' },
  td: { padding: '0.75rem', borderBottom: '1px solid #eee' },
  badge: (status) => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    backgroundColor: status === 'confirmed' ? '#eafaf1' : status === 'cancelled' ? '#fdf0ef' : '#fef9e7',
    color: status === 'confirmed' ? '#27ae60' : status === 'cancelled' ? '#e74c3c' : '#f39c12',
  }),
  button: { padding: '0.4rem 0.8rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { textAlign: 'center', color: '#999', padding: '3rem' },
  loading: { textAlign: 'center', padding: '2rem', color: '#666' },
  error: { color: '#e74c3c', padding: '0.75rem', backgroundColor: '#fdf0ef', borderRadius: '4px', marginBottom: '1rem' },
};

const CustomerDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      setError('');
      const { data } = await reservationsAPI.getMy();
      setReservations(data);
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await reservationsAPI.cancel(id);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) return <div style={styles.loading}>Loading reservations...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Reservations</h2>
        <Link to="/reservations/new" style={styles.linkButton}>+ New Reservation</Link>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {reservations.length === 0 ? (
        <div style={styles.empty}>
          <p>No reservations yet.</p>
          <Link to="/reservations/new">Book your first table!</Link>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Guests</th>
              <th style={styles.th}>Table</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id}>
                <td style={styles.td}>{new Date(r.date).toLocaleDateString()}</td>
                <td style={styles.td}>{r.timeSlot}</td>
                <td style={styles.td}>{r.guests}</td>
                <td style={styles.td}>#{r.table?.tableNumber} ({r.table?.capacity}pax)</td>
                <td style={styles.td}><span style={styles.badge(r.status)}>{r.status}</span></td>
                <td style={styles.td}>
                  {r.status === 'confirmed' && (
                    <button onClick={() => handleCancel(r._id)} style={styles.button}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerDashboard;
