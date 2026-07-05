import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TIME_SLOTS = ['11:00', '12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

export default function NewReservation() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!date || !timeSlot || !numberOfGuests) {
      setAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const { data } = await reservationsAPI.checkAvailability({ date, timeSlot, numberOfGuests });
        setAvailability(data.tables || []);
      } catch {
        setAvailability(null);
      } finally {
        setChecking(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [date, timeSlot, numberOfGuests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await reservationsAPI.create({ date, timeSlot, numberOfGuests });
      addToast(`Reservation confirmed! Table ${data.reservation.table.tableNumber} at ${timeSlot} on ${date}.`, 'success');
      setTimeout(() => navigate('/reservations'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const availableTables = useMemo(() => availability?.filter((table) => table.available) || [], [availability]);
  const recommendedTable = availableTables
    .slice()
    .sort((a, b) => a.capacity - b.capacity || a.tableNumber - b.tableNumber)[0];

  return (
    <div className="page-card booking-page">
      <div className="page-header">
        <span className="eyebrow">New booking</span>
        <h1>Reserve a table</h1>
        <p>The system assigns the smallest available table that fits your party for the selected slot.</p>
      </div>
      <div className="booking-layout">
        <form onSubmit={handleSubmit} className="reservation-form">
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required>
              <option value="">Select a time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Number of Guests</label>
            <input type="number" value={numberOfGuests} min={1} max={20} onChange={(e) => setNumberOfGuests(Number(e.target.value))} required />
          </div>
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? 'Booking...' : 'Book a Table'}
          </button>
        </form>
        <aside className="helper-panel">
          <div className="availability-card">
            <span className="eyebrow">Live check</span>
            <h2>Availability</h2>
            {!date || !timeSlot ? (
              <p>Choose a date and time to see matching table availability.</p>
            ) : checking ? (
              <p>Checking tables for this slot...</p>
            ) : availability ? (
              <>
                <div className={availableTables.length ? 'availability-result available' : 'availability-result full'}>
                  <strong>{availableTables.length}</strong>
                  <span>{availableTables.length === 1 ? 'table available' : 'tables available'}</span>
                </div>
                {recommendedTable ? (
                  <p>Best fit: Table {recommendedTable.tableNumber}, {recommendedTable.capacity} seats, {recommendedTable.location}.</p>
                ) : (
                  <p>No table currently fits this party size for the selected slot.</p>
                )}
              </>
            ) : (
              <p>Availability will appear here once the booking details are complete.</p>
            )}
          </div>
          <div className="rule-list">
            <span>Confirmed bookings block a table for the selected slot.</span>
            <span>Cancelled bookings release that table immediately.</span>
            <span>The backend assigns the smallest table that fits the party.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
