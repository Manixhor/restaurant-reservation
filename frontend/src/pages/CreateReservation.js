import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsAPI, tablesAPI } from '../api';

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const styles = {
  container: { maxWidth: '500px', margin: '2rem auto', padding: '2rem' },
  title: { marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  select: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', backgroundColor: '#fff' },
  button: { padding: '0.75rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  buttonSecondary: { padding: '0.75rem', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#e74c3c', padding: '0.75rem', backgroundColor: '#fdf0ef', borderRadius: '4px', marginBottom: '0.5rem' },
  success: { color: '#27ae60', padding: '0.75rem', backgroundColor: '#eafaf1', borderRadius: '4px', marginBottom: '0.5rem' },
  info: { color: '#666', fontSize: '0.85rem', marginTop: '1rem' },
};

const CreateReservation = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState('');
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    tablesAPI.getAll()
      .then(({ data }) => setTables(data))
      .catch(() => {});
  }, []);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { data } = await reservationsAPI.create({ date, timeSlot, guests: parseInt(guests) });
      setSuccess(`Reservation confirmed! Table #${data.table.tableNumber} on ${new Date(data.date).toLocaleDateString()} at ${data.timeSlot} for ${data.guests} guests.`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const maxCapacity = tables.length > 0 ? Math.max(...tables.map(t => t.capacity)) : 20;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Reservation</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', color: '#555', fontWeight: 500 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={getMinDate()} style={styles.input} required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', color: '#555', fontWeight: 500 }}>Time</label>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={styles.select} required>
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', color: '#555', fontWeight: 500 }}>Number of Guests</label>
          <input type="number" value={guests} onChange={(e) => setGuests(e.target.value)} min="1" max={maxCapacity} placeholder="1" style={styles.input} required />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Booking...' : 'Book Table'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} style={styles.buttonSecondary}>
            Cancel
          </button>
        </div>
      </form>
      <div style={styles.info}>
        Available tables: {tables.map(t => `T${t.tableNumber} (${t.capacity}pax)`).join(', ')}
      </div>
    </div>
  );
};

export default CreateReservation;
