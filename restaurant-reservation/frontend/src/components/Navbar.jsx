import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className={`navbar ${user.role === 'admin' ? 'navbar-admin' : 'navbar-customer'}`}>
      <div className="nav-brand">
        <Link to="/dashboard">ReserveTable</Link>
      </div>
      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin/reservations">All Reservations</Link>
            <Link to="/admin/tables">Manage Tables</Link>
          </>
        ) : (
          <>
            <Link to="/reservations/new">New Reservation</Link>
            <Link to="/reservations">My Reservations</Link>
          </>
        )}
        <span className="nav-user">{user.name} ({user.role})</span>
        <button onClick={handleLogout} className="btn btn-sm">Logout</button>
      </div>
    </nav>
  );
}
