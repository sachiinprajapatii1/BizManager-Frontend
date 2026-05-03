// src/pages/Payments.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function Avatar({ name }) {
  const colors = ['#22c55e','#60a5fa','#f87171','#fbbf24','#a78bfa'];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 10, background: color + '20',
      border: `1px solid ${color}40`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color, flexShrink: 0,
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

export default function Payments() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [settling,  setSettling]  = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers', { params: { limit: 200 } });
      setCustomers(res.data.customers);
    } catch { toast.error('Data load nahi hua'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const settleAll = async (c) => {
    if (!confirm(`${c.name} ke saare ${fmt(c.totalDue)} settle karna chahte ho?`)) return;
    setSettling(c._id);
    try {
      const res = await api.patch(`/api/records/settle/${c._id}`);
      toast.success(`${res.data.modified} records settle ho gaye! 🎉`);
      fetchData();
    } catch { toast.error('Settle nahi hua'); }
    finally { setSettling(null); }
  };

  const pending = customers.filter(c => c.totalDue > 0 && c.name.toLowerCase().includes(search.toLowerCase()));
  const clear   = customers.filter(c => c.totalDue === 0 && c.isActive && c.name.toLowerCase().includes(search.toLowerCase()));
  const totalPending = customers.reduce((s, c) => s + (c.totalDue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>Payments</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>Kiska kitna baaki hai</p>
      </div>

      {/* Total pending banner */}
      {totalPending > 0 && (
        <div style={{
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 18, padding: '18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: 'var(--red)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
              Total Pending
            </p>
            <p style={{ color: 'var(--red)', fontWeight: 800, fontSize: '2rem', margin: 0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
              {fmt(totalPending)}
            </p>
            <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: '4px 0 0' }}>{pending.length} customers ke baaki hain</p>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.6 }}>⏳</div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Customer dhundo..." className="input" style={{ paddingLeft: 42 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 30, height: 30, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <p style={{ color: 'var(--text2)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                Pending ({pending.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pending.sort((a,b) => b.totalDue - a.totalDue).map(c => (
                  <div key={c._id} style={{
                    background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.15)',
                    borderRadius: 16, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'}>
                    <Avatar name={c.name} />
                    <Link to={`/customers/${c._id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                      <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>{c.phone || 'No phone'}</p>
                    </Link>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, color: 'var(--red)', fontSize: '1.2rem', margin: '0 0 6px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {fmt(c.totalDue)}
                      </p>
                      <button onClick={() => settleAll(c)} disabled={settling === c._id} style={{
                        padding: '5px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                        background: settling === c._id ? 'var(--surface2)' : 'var(--green)',
                        color: settling === c._id ? 'var(--text2)' : '#0a1f12',
                        border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                        boxShadow: settling !== c._id ? '0 0 12px var(--green-glow)' : 'none',
                      }}>
                        {settling === c._id ? '...' : 'Settle ✓'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && !search && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0 0 10px' }}>🎉</p>
              <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sab clear hai!</p>
              <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>Kisi ka bhi koi pending nahi</p>
            </div>
          )}

          {/* Clear */}
          {clear.length > 0 && (
            <div>
              <p style={{ color: 'var(--text2)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                Clear ({clear.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {clear.map(c => (
                  <Link key={c._id} to={`/customers/${c._id}`} style={{
                    background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)',
                    borderRadius: 14, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.12)'}>
                    <Avatar name={c.name} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.84rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                      <span className="badge-paid">Clear ✓</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}