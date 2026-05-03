// src/pages/Records.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function Records() {
  const [records,   setRecords]   = useState([]);
  const [customers, setCust]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [filters,   setFilters]   = useState({ paid: '', customer: '', from: '', to: '' });

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ customerId:'', date: today, quantity:1, rate:'', notes:'', paid: false });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filters.paid !== '')  params.paid     = filters.paid;
      if (filters.customer)     params.customer = filters.customer;
      if (filters.from)         params.from     = filters.from;
      if (filters.to)           params.to       = filters.to;

      const [recRes, custRes] = await Promise.all([
        api.get('/api/records', { params }),
        api.get('/api/customers', { params: { limit: 200 } }),
      ]);
      setRecords(recRes.data.records);
      setCust(custRes.data.customers);
    } catch { toast.error('Records load nahi hue'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!form.customerId) return toast.error('Customer select karo');
    if (!form.rate)       return toast.error('Rate daalo');
    setSaving(true);
    try {
      await api.post('/api/records', { ...form, quantity: Number(form.quantity), rate: Number(form.rate) });
      toast.success('Record add ho gaya! ✓');
      setShowAdd(false);
      setForm({ customerId:'', date: today, quantity:1, rate:'', notes:'', paid: false });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const togglePaid = async (r) => {
    try {
      await api.patch(`/api/records/${r._id}/toggle-paid`);
      toast.success(r.paid ? 'Unpaid mark ho gaya' : 'Paid ✓');
      fetchAll();
    } catch { toast.error('Update nahi hua'); }
  };

  const deleteRec = async (r) => {
    if (!confirm('Record delete karna chahte ho?')) return;
    try {
      await api.delete(`/api/records/${r._id}`);
      toast.success('Delete ho gaya');
      fetchAll();
    } catch { toast.error('Delete nahi hua'); }
  };

  const set    = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  const setFrm = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  };

  const selectedCust = customers.find(c => c._id === form.customerId);
  const amount       = (Number(form.quantity) * Number(form.rate)).toFixed(2);

  const totalAmt   = records.reduce((s, r) => s + r.amount, 0);
  const paidAmt    = records.filter(r => r.paid).reduce((s, r) => s + r.amount, 0);
  const pendingAmt = totalAmt - paidAmt;

  // Auto-fill rate when customer selected
  const handleCustChange = (e) => {
    const custId = e.target.value;
    const cust   = customers.find(c => c._id === custId);
    setForm(f => ({ ...f, customerId: custId, rate: cust?.defaultRate || f.rate }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>Records</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>{records.length} entries</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Record</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total', value: fmt(totalAmt), color: 'var(--text)' },
          { label: 'Paid',  value: fmt(paidAmt),  color: 'var(--green)' },
          { label: 'Pending', value: fmt(pendingAmt), color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text3)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
              {s.label}
            </p>
            <p style={{ color: s.color, fontWeight: 800, fontSize: '1.2rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <select name="paid" value={filters.paid} onChange={set} className="input" style={{ fontSize: '0.8rem' }}>
          <option value="">All Status</option>
          <option value="false">○ Unpaid</option>
          <option value="true">✓ Paid</option>
        </select>
        <select name="customer" value={filters.customer} onChange={set} className="input" style={{ fontSize: '0.8rem' }}>
          <option value="">All Customers</option>
          {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input name="from" type="date" value={filters.from} onChange={set} className="input" style={{ fontSize: '0.8rem' }} />
        <input name="to"   type="date" value={filters.to}   onChange={set} className="input" style={{ fontSize: '0.8rem' }} />
      </div>

      {/* Filter tags */}
      {(filters.paid !== '' || filters.customer || filters.from || filters.to) && (
        <button onClick={() => setFilters({ paid:'', customer:'', from:'', to:'' })}
          style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
          × Filters clear karo
        </button>
      )}

      {/* Records list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 30, height: 30, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : records.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 10px' }}>📋</p>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem', margin: 0 }}>Koi record nahi mila</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {records.map(r => (
            <div key={r._id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              {/* Status indicator */}
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginLeft: 2,
                background: r.paid ? 'var(--green)' : 'var(--red)',
                boxShadow: r.paid ? '0 0 6px var(--green)' : '0 0 6px var(--red)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', margin: 0 }}>{r.customer?.name}</p>
                  <span className={r.paid ? 'badge-paid' : 'badge-unpaid'}>{r.paid ? '✓ Paid' : '○ Due'}</span>
                </div>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>
                  {new Date(r.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                  {' · '}{r.quantity} {r.customer?.unit} × ₹{r.rate}
                </p>
                {r.notes && <p style={{ color: 'var(--text3)', fontSize: '0.7rem', margin: '2px 0 0', fontStyle: 'italic' }}>{r.notes}</p>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem' }}>{fmt(r.amount)}</p>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button onClick={() => togglePaid(r)} style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                    color: 'var(--blue)', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                    fontFamily: 'Sora, sans-serif',
                  }}>{r.paid ? 'Unpaid' : 'Paid ✓'}</button>
                  <button onClick={() => deleteRec(r)} style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                    color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
                    fontFamily: 'Sora, sans-serif',
                  }}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Naya Record" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Customer *</label>
              <select name="customerId" value={form.customerId} onChange={handleCustChange} className="input">
                <option value="">Customer select karo</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Date</label>
                <input name="date" type="date" value={form.date} onChange={setFrm} className="input" />
              </div>
              <div>
                <label className="label">Qty {selectedCust ? `(${selectedCust.unit})` : ''}</label>
                <input name="quantity" type="number" step="0.5" min="0" value={form.quantity} onChange={setFrm} className="input" />
              </div>
              <div>
                <label className="label">Rate (₹)</label>
                <input name="rate" type="number" value={form.rate}
                  onChange={setFrm}
                  placeholder={selectedCust ? `Default: ${selectedCust.defaultRate}` : '0'}
                  className="input" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 12, padding: '10px 14px', width: '100%',
                }}>
                  <p style={{ color: 'var(--text3)', fontSize: '0.68rem', fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</p>
                  <p style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>₹{amount}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Notes (Optional)</label>
              <input name="notes" value={form.notes} onChange={setFrm} placeholder="Koi note..." className="input" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input name="paid" type="checkbox" checked={form.paid} onChange={setFrm}
                style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
              <span style={{ color: 'var(--text)', fontSize: '0.84rem', fontWeight: 500 }}>Paid abhi? (cash liya)</span>
            </label>
            <button onClick={handleAdd} disabled={saving} className="btn-primary" style={{ width: '100%', padding: 12 }}>
              {saving ? 'Adding...' : 'Record add karo'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}