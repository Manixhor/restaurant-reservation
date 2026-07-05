import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservationsAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = user.role === 'admin'
      ? reservationsAPI.getAll({ limit: 100 })
      : reservationsAPI.getMine();
    fetch.then((res) => setReservations(res.data.reservations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = reservations.filter(r => r.status === 'confirmed' && r.date >= today);
  const past = reservations.filter(r => r.status === 'confirmed' && r.date < today);
  const cancelled = reservations.filter(r => r.status === 'cancelled');

  const StatsCard = ({ label, value, color }) => (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">{user?.role === 'admin' ? 'Admin workspace' : 'Customer dashboard'}</span>
          <h1>Welcome, {user?.name}</h1>
          <p>{user?.role === 'admin' ? 'Review bookings, resolve conflicts, and keep table capacity accurate.' : 'Book a table, track upcoming reservations, and cancel when plans change.'}</p>
          <span className="role-badge">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</span>
        </div>
      </div>

      {!loading && (
        <div className="stats-grid">
          <StatsCard label="Total Reservations" value={reservations.length} />
          <StatsCard label="Upcoming" value={upcoming.length} color="#2d7d46" />
          <StatsCard label="Past" value={past.length} color="#6b7280" />
          <StatsCard label="Cancelled" value={cancelled.length} color="#c62828" />
        </div>
      )}

      <div className="quick-actions">
        {user?.role === 'admin' ? (
          <>
            <button className="btn btn-accent" onClick={() => navigate('/admin/reservations')}>View All Reservations</button>
            <button className="btn" onClick={() => navigate('/admin/tables')}>Manage Tables</button>
          </>
        ) : (
          <>
            <button className="btn btn-accent" onClick={() => navigate('/reservations/new')}>Make a Reservation</button>
            <button className="btn" onClick={() => navigate('/reservations')}>My Reservations</button>
          </>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : reservations.length > 0 ? (
        <div className="section">
          <h2>Recent Reservations</h2>
          <div className="reservation-list">
            {reservations.slice(0, 5).map((r) => (
              <div key={r._id} className={`reservation-card ${r.status}`}>
                <div className="reservation-main">
                  <span className="res-date">{r.date}</span>
                  <span className="res-time">{r.timeSlot}</span>
                  <span className="res-guests">{r.numberOfGuests} {r.numberOfGuests === 1 ? 'guest' : 'guests'}</span>
                  {r.table && <span className="res-table">Table {r.table.tableNumber}</span>}
                </div>
                <span className={`status-badge ${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="section">
          <div className="empty-state">
            <p>No reservations yet.</p>
            {user?.role !== 'admin' && (
              <button className="btn btn-accent" onClick={() => navigate('/reservations/new')}>Make Your First Reservation</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
