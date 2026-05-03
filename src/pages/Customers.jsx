// src/pages/Customers.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name:'', phone:'', address:'', defaultRate:'', unit:'litre', notes:'' };

function CustomerForm({ initial = EMPTY_FORM, onSave, loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="label">Naam *</label>
        <input name="name" required value={form.name} onChange={set} placeholder="Customer ka naam" className="input" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className="input" />
        </div>
        <div>
          <label className="label">Default Rate (₹)</label>
          <input name="defaultRate" type="number" value={form.defaultRate} onChange={set} placeholder="50" className="input" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Unit</label>
          <select name="unit" value={form.unit} onChange={set} className="input">
            {['litre','kg','piece','service','unit'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" value={form.address} onChange={set} placeholder="Ghar ka address" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={set} rows={2}
          placeholder="Koi special note..." className="input" style={{ resize: 'none' }} />
      </div>
      <button onClick={() => onSave(form)} disabled={loading || !form.name.trim()} className="btn-primary"
        style={{ width: '100%', padding: 12, marginTop: 4 }}>
        {loading ? 'Saving...' : 'Save karo'}
      </button>
    </div>
  );
}

function InitialAvatar({ name }) {
  const colors = ['#22c55e','#60a5fa','#f87171','#fbbf24','#a78bfa','#34d399'];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, background: color + '20',
      border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: '1rem', color, flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(null);
  const [saving,    setSaving]    = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers', { params: { limit: 200 } });
      setCustomers(res.data.customers);
    } catch { toast.error('Customers load nahi hue'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await api.post('/api/customers', form);
      toast.success('Customer add ho gaya!');
      setModal(null);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/api/customers/${modal.customer._id}`, form);
      toast.success('Customer update ho gaya!');
      setModal(null);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`"${c.name}" ko delete karna chahte ho?`)) return;
    try {
      await api.delete(`/api/customers/${c._id}`);
      toast.success(`${c.name} delete ho gaya`);
      fetchCustomers();
    } catch { toast.error('Delete nahi hua'); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
            Customers
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>{customers.length} total customers</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '1rem' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Naam ya phone se search karo..."
          className="input" style={{ paddingLeft: 42 }} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 30, height: 30, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👥</div>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', margin: '0 0 16px' }}>
            {search ? 'Koi match nahi mila' : 'Abhi koi customer nahi hai'}
          </p>
          {!search && <button onClick={() => setModal('add')} className="btn-primary">Pehla customer add karo</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(c => (
            <div key={c._id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 18, padding: '16px 18px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <InitialAvatar name={c.name} />
                <Link to={`/customers/${c._id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.75rem', margin: '0 0 6px' }}>{c.phone || 'No phone'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text2)', fontSize: '0.72rem' }}>₹{c.defaultRate}/{c.unit}</span>
                    {c.totalDue > 0
                      ? <span className="badge-unpaid">₹{c.totalDue.toLocaleString('en-IN')} due</span>
                      : <span className="badge-paid">Clear ✓</span>
                    }
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => setModal({ customer: c })} style={{
                    width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)',
                    border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8rem',
                    color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✏️</button>
                  <button onClick={() => handleDelete(c)} style={{
                    width: 30, height: 30, borderRadius: 8, background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.15)', cursor: 'pointer', fontSize: '0.8rem',
                    color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'add' && (
        <Modal title="Naya Customer" onClose={() => setModal(null)}>
          <CustomerForm onSave={handleAdd} loading={saving} />
        </Modal>
      )}
      {modal?.customer && (
        <Modal title="Customer Edit" onClose={() => setModal(null)}>
          <CustomerForm initial={modal.customer} onSave={handleEdit} loading={saving} />
        </Modal>
      )}
    </div>
  );
}