// src/pages/CustomerDetail.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function AddRecordForm({ customer, onSave, loading }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, quantity: 1, rate: customer.defaultRate || '', notes: '', paid: false });
  const set = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  };
  const amount = (Number(form.quantity) * Number(form.rate)).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Date</label>
          <input name="date" type="date" value={form.date} onChange={set} className="input" />
        </div>
        <div>
          <label className="label">Qty ({customer.unit})</label>
          <input name="quantity" type="number" step="0.5" min="0" value={form.quantity} onChange={set} className="input" />
        </div>
        <div>
          <label className="label">Rate (₹/{customer.unit})</label>
          <input name="rate" type="number" value={form.rate} onChange={set} className="input" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '10px 14px', width: '100%' }}>
            <p style={{ color: 'var(--text3)', fontSize: '0.68rem', fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</p>
            <p style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>₹{amount}</p>
          </div>
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <input name="notes" value={form.notes} onChange={set} placeholder="Optional" className="input" />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input name="paid" type="checkbox" checked={form.paid} onChange={set} style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
        <span style={{ color: 'var(--text)', fontSize: '0.84rem', fontWeight: 500 }}>Paid abhi? (cash liya)</span>
      </label>
      <button onClick={() => onSave({ ...form, customerId: customer._id, quantity: Number(form.quantity), rate: Number(form.rate) })}
        disabled={loading || !form.rate} className="btn-primary" style={{ width: '100%', padding: 12 }}>
        {loading ? 'Adding...' : 'Record add karo'}
      </button>
    </div>
  );
}

export default function CustomerDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [summary,  setSummary]  = useState(null);
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [filter,   setFilter]   = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, recRes] = await Promise.all([
        api.get(`/api/customers/${id}`),
        api.get('/api/records', { params: { customer: id, limit: 200 } }),
      ]);
      setCustomer(custRes.data.customer);
      setSummary(custRes.data.summary);
      setRecords(recRes.data.records);
    } catch { toast.error('Data load nahi hua'); }
    finally  { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddRecord = async (form) => {
    setSaving(true);
    try {
      await api.post('/api/records', form);
      toast.success('Record add ho gaya!');
      setShowAdd(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const togglePaid = async (rec) => {
    try {
      await api.patch(`/api/records/${rec._id}/toggle-paid`);
      toast.success(rec.paid ? 'Unpaid mark ho gaya' : 'Paid mark ho gaya ✓');
      fetchData();
    } catch { toast.error('Update nahi hua'); }
  };

  const deleteRecord = async (rec) => {
    if (!confirm('Record delete karna chahte ho?')) return;
    try {
      await api.delete(`/api/records/${rec._id}`);
      toast.success('Record delete ho gaya');
      fetchData();
    } catch { toast.error('Delete nahi hua'); }
  };

  const settleAll = async () => {
    if (!confirm('Saare unpaid records settle karna chahte ho?')) return;
    try {
      const res = await api.patch(`/api/records/settle/${id}`);
      toast.success(`${res.data.modified} records settle ho gaye! 🎉`);
      fetchData();
    } catch { toast.error('Settle nahi hua'); }
  };

  const handleDelete = async () => {
    if (!confirm(`"${customer.name}" aur unke saare records delete karna chahte ho?`)) return;
    try {
      await api.delete(`/api/customers/${id}`);
      toast.success('Customer delete ho gaya');
      navigate('/customers');
    } catch { toast.error('Delete nahi hua'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!customer) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text2)', margin: '0 0 12px' }}>Customer nahi mila</p>
      <Link to="/customers" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>← Wapas</Link>
    </div>
  );

  const shown = records.filter(r => filter === 'all' ? true : filter === 'paid' ? r.paid : !r.paid);

  const nameColors = ['#22c55e','#60a5fa','#f87171','#fbbf24','#a78bfa'];
  const nameColor  = nameColors[customer.name.charCodeAt(0) % nameColors.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <Link to="/customers" style={{ color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        ← Customers
      </Link>

      {/* Customer header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: nameColor + '20',
              border: `1px solid ${nameColor}40`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color: nameColor,
            }}>{customer.name.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.3rem', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                {customer.name}
              </h1>
              <p style={{ color: 'var(--text3)', fontSize: '0.78rem', margin: '0 0 2px' }}>{customer.phone || 'No phone'}</p>
              <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>
                {customer.address && `${customer.address} · `}Rate: ₹{customer.defaultRate}/{customer.unit}
              </p>
            </div>
          </div>
          <button onClick={handleDelete} style={{
            width: 34, height: 34, borderRadius: 10, background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.15)', cursor: 'pointer',
            color: 'var(--red)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>🗑️</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total',   value: fmt(summary?.totalAmount),   color: 'var(--text)',  bg: 'var(--surface2)' },
            { label: 'Paid',    value: fmt(summary?.paidAmount),    color: 'var(--green)', bg: 'rgba(34,197,94,0.06)' },
            { label: 'Pending', value: fmt(summary?.pendingAmount), color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ color: s.color, fontWeight: 800, margin: 0, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ flex: 1 }}>
            + Add Record
          </button>
          {summary?.unpaidCount > 0 && (
            <button onClick={settleAll} style={{
              flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
              background: 'rgba(34,197,94,0.1)', color: 'var(--green)',
              border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            }}>
              ✓ Settle All ({fmt(summary.pendingAmount)})
            </button>
          )}
        </div>
      </div>

      {/* Records */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>Records ({records.length})</p>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
            {['all', 'unpaid', 'paid'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 12px', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'Sora, sans-serif', border: 'none',
                background: filter === f ? 'var(--surface2)' : 'transparent',
                color: filter === f ? 'var(--text)' : 'var(--text3)',
                boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              }}>
                {f === 'all' ? 'All' : f === 'paid' ? '✓ Paid' : '○ Unpaid'}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.86rem' }}>
            Koi record nahi hai
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shown.map(r => (
              <div key={r._id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: r.paid ? 'var(--green)' : 'var(--red)',
                  boxShadow: r.paid ? '0 0 6px var(--green)' : '0 0 6px var(--red)',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.86rem', margin: 0 }}>
                      {new Date(r.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </p>
                    <span className={r.paid ? 'badge-paid' : 'badge-unpaid'}>{r.paid ? '✓ Paid' : '○ Due'}</span>
                  </div>
                  <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>
                    {r.quantity} {r.customer?.unit} × ₹{r.rate}
                  </p>
                  {r.notes && <p style={{ color: 'var(--text3)', fontSize: '0.7rem', fontStyle: 'italic', margin: '2px 0 0' }}>{r.notes}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 5px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem' }}>
                    {fmt(r.amount)}
                  </p>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => togglePaid(r)} style={{
                      fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                      color: 'var(--blue)', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                      fontFamily: 'Sora, sans-serif',
                    }}>{r.paid ? 'Unpaid' : 'Paid ✓'}</button>
                    <button onClick={() => deleteRecord(r)} style={{
                      fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                      color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
                      fontFamily: 'Sora, sans-serif',
                    }}>Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title={`Record — ${customer.name}`} onClose={() => setShowAdd(false)}>
          <AddRecordForm customer={customer} onSave={handleAddRecord} loading={saving} />
        </Modal>
      )}
    </div>
  );
}