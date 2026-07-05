import { useState, useEffect } from 'react';
import { tablesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function ManageTables() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '', location: 'Main Hall' });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0);
  const largestTable = tables.reduce((max, table) => Math.max(max, table.capacity), 0);

  const loadTables = () => {
    setLoading(true);
    tablesAPI.getAll()
      .then((res) => setTables(res.data.tables))
      .catch(() => setError('Failed to load tables.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTables(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tablesAPI.create({ ...form, tableNumber: Number(form.tableNumber), capacity: Number(form.capacity) });
      setShowForm(false);
      setForm({ tableNumber: '', capacity: '', location: 'Main Hall' });
      addToast('Table added.', 'success');
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create table.');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await tablesAPI.update(id, { capacity: Number(form.capacity), location: form.location });
      setEditingId(null);
      setForm({ tableNumber: '', capacity: '', location: 'Main Hall' });
      addToast('Table updated.', 'success');
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update table.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await tablesAPI.delete(deleteTarget._id);
      addToast('Table deleted.', 'info');
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete table.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const startEdit = (table) => {
    setEditingId(table._id);
    setForm({ tableNumber: table.tableNumber, capacity: table.capacity, location: table.location });
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page-card">
      <div className="page-header-row">
        <div className="page-header">
          <span className="eyebrow">Admin control</span>
          <h1>Manage Tables</h1>
          <p>Keep table numbers, seating capacity, and floor locations accurate for assignment logic.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Table'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="summary-strip table-summary" aria-label="Table summary">
        <div>
          <span>Tables</span>
          <strong>{tables.length}</strong>
        </div>
        <div>
          <span>Total seats</span>
          <strong>{totalSeats}</strong>
        </div>
        <div>
          <span>Largest table</span>
          <strong>{largestTable}</strong>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="add-table-form">
          <div className="form-group">
            <label>Table Number</label>
            <input type="number" value={form.tableNumber} min={1} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" value={form.capacity} min={1} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary full-width">Create Table</button>
        </form>
      )}

      {tables.length === 0 ? (
        <div className="empty-state"><p>No tables configured.</p></div>
      ) : (
        <div className="table-list">
          {tables.map((t) => (
            <div key={t._id} className="table-card">
              {editingId === t._id ? (
                <div className="edit-form table-edit-form">
                  <input type="number" value={form.capacity} min={1} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" />
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
                  <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(t._id)}>Save</button>
                  <button className="btn btn-sm" onClick={() => { setEditingId(null); setForm({ tableNumber: '', capacity: '', location: 'Main Hall' }); }}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="table-info">
                    <span className="table-number">Table {t.tableNumber}</span>
                    <span className="table-capacity">{t.capacity} seats</span>
                    <span className="table-location">{t.location}</span>
                  </div>
                  <div className="table-actions">
                    <button className="btn btn-sm" onClick={() => startEdit(t)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(t)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Table"
          message={`Delete Table ${deleteTarget.tableNumber} (${deleteTarget.capacity} seats, ${deleteTarget.location})? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Delete"
          danger
        />
      )}
    </div>
  );
}
