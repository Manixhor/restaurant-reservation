import React, { useState, useEffect } from 'react';
import { tablesAPI } from '../api';

const styles = {
  container: { maxWidth: '700px', margin: '2rem auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  addButton: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ddd', color: '#555', fontSize: '0.85rem', textTransform: 'uppercase' },
  td: { padding: '0.75rem', borderBottom: '1px solid #eee' },
  input: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' },
  select: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: '#fff' },
  button: { padding: '0.3rem 0.6rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  editButton: { padding: '0.3rem 0.6rem', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.3rem' },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' },
  error: { color: '#e74c3c', padding: '0.75rem', backgroundColor: '#fdf0ef', borderRadius: '4px', marginBottom: '1rem' },
  success: { color: '#27ae60', padding: '0.75rem', backgroundColor: '#eafaf1', borderRadius: '4px', marginBottom: '1rem' },
  loading: { textAlign: 'center', padding: '2rem', color: '#666' },
};

const ManageTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '', location: 'indoor' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchTables = async () => {
    try {
      const { data } = await tablesAPI.getAll();
      setTables(data);
    } catch {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await tablesAPI.create({ ...form, tableNumber: parseInt(form.tableNumber), capacity: parseInt(form.capacity) });
      setSuccess(`Table #${form.tableNumber} added`);
      setForm({ tableNumber: '', capacity: '', location: 'indoor' });
      setShowForm(false);
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add table');
    }
  };

  const startEdit = (table) => {
    setEditing(table._id);
    setEditForm({ tableNumber: table.tableNumber, capacity: table.capacity, location: table.location });
  };

  const saveEdit = async (id) => {
    try {
      await tablesAPI.update(id, { ...editForm, tableNumber: parseInt(editForm.tableNumber), capacity: parseInt(editForm.capacity) });
      setEditing(null);
      setSuccess('Table updated');
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await tablesAPI.remove(id);
      setSuccess('Table removed');
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div style={styles.loading}>Loading tables...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manage Tables</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          {showForm ? 'Cancel' : '+ Add Table'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input type="number" placeholder="Table #" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} style={{ ...styles.input, width: '80px' }} required min="1" />
          <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ ...styles.input, width: '80px' }} required min="1" />
          <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={styles.select}>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="bar">Bar</option>
          </select>
          <button type="submit" style={{ ...styles.addButton }}>Add</button>
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Table #</th>
            <th style={styles.th}>Capacity</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((t) => (
            <tr key={t._id}>
              {editing === t._id ? (
                <>
                  <td style={styles.td}><input type="number" value={editForm.tableNumber} onChange={(e) => setEditForm({ ...editForm, tableNumber: e.target.value })} style={{ ...styles.input, width: '60px' }} min="1" /></td>
                  <td style={styles.td}><input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} style={{ ...styles.input, width: '60px' }} min="1" /></td>
                  <td style={styles.td}>
                    <select value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={styles.select}>
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="bar">Bar</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => saveEdit(t._id)} style={{ ...styles.editButton, backgroundColor: '#27ae60' }}>Save</button>
                    <button onClick={() => setEditing(null)} style={{ ...styles.button, backgroundColor: '#666' }}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={styles.td}>{t.tableNumber}</td>
                  <td style={styles.td}>{t.capacity} guests</td>
                  <td style={styles.td}>{t.location}</td>
                  <td style={styles.td}>
                    <button onClick={() => startEdit(t)} style={styles.editButton}>Edit</button>
                    <button onClick={() => handleDelete(t._id)} style={styles.button}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageTables;
