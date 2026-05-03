// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function StatCard({ label, value, sub, color = 'default', icon }) {
  const colorMap = {
    green:   { glow: 'rgba(34,197,94,0.1)',  text: 'var(--green)', border: 'rgba(34,197,94,0.2)'  },
    red:     { glow: 'rgba(248,113,113,0.1)', text: 'var(--red)',   border: 'rgba(248,113,113,0.2)' },
    amber:   { glow: 'rgba(251,191,36,0.1)', text: 'var(--amber)', border: 'rgba(251,191,36,0.2)' },
    blue:    { glow: 'rgba(96,165,250,0.1)', text: 'var(--blue)',  border: 'rgba(96,165,250,0.2)'  },
    default: { glow: 'rgba(255,255,255,0.03)', text: 'var(--text)', border: 'var(--border)'       },
  };
  const c = colorMap[color] || colorMap.default;

  return (
    <div style={{
      background: `linear-gradient(135deg, var(--surface) 0%, ${c.glow} 100%)`,
      border: `1px solid ${c.border}`, borderRadius: 18, padding: '18px 20px',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ color: 'var(--text2)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
          {label}
        </p>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      </div>
      <p style={{ color: c.text, fontWeight: 800, fontSize: '1.7rem', margin: 0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
        {value}
      </p>
      {sub && <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user }        = useAuth();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setL(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { stats, recentRecords = [], topDebtors = [] } = data || {};
  const biz = { milkman:'🥛', barber:'✂️', kirana:'🏪', other:'💼' }[user?.businessType] || '💼';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now  = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
            Namaste, {user?.name?.split(' ')[0]}! {biz}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>
            {user?.businessName} &nbsp;·&nbsp; {days[now.getDay()]}, {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
          background: 'var(--green-glow)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)',
        }}>
          LIVE
        </div>
      </div>

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Total Customers"  value={stats?.totalCustomers || 0}  icon="👥" color="blue"  />
        <StatCard label="Total Earnings"   value={fmt(stats?.totalEarnings)}    icon="💰" color="green" />
        <StatCard label="Pending"          value={fmt(stats?.pendingAmount)}    icon="⏳" color="red"   sub={`${stats?.unpaidCount || 0} records baaki`} />
        <StatCard label="Aaj ka"           value={fmt(stats?.todayAmount)}      icon="📅" color="amber" sub={`${stats?.todayCount || 0} records`} />
        <StatCard label="Total Records"    value={stats?.totalRecords || 0}     icon="📋" />
        <StatCard label="Paid Records"     value={stats?.paidCount || 0}        icon="✅" color="green" />
      </div>

      {/* Quick Actions */}
      <div>
        <p style={{ color: 'var(--text2)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { to: '/customers', label: 'Add Customer', icon: '➕', sub: 'Naya' },
            { to: '/records',   label: 'Add Record',   icon: '📝', sub: 'Entry' },
            { to: '/payments',  label: 'Payments',     icon: '💸', sub: 'Dues' },
            { to: '/customers', label: 'View All',     icon: '👁', sub: 'List' },
          ].map(a => (
            <Link key={a.label} to={a.to} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 10px', textAlign: 'center',
              textDecoration: 'none', transition: 'all 0.2s', display: 'block',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{a.icon}</div>
              <p style={{ color: 'var(--text)', fontSize: '0.72rem', fontWeight: 700, margin: '0 0 1px' }}>{a.label}</p>
              <p style={{ color: 'var(--text3)', fontSize: '0.65rem', margin: 0 }}>{a.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>

        {/* Recent Records */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', margin: 0 }}>Recent Records</p>
            <Link to="/records" style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {recentRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: '0.82rem' }}>
              Koi record nahi hai abhi
            </div>
          ) : recentRecords.map(r => (
            <div key={r._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.84rem', margin: '0 0 2px' }}>{r.customer?.name}</p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>
                  {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', margin: '0 0 2px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmt(r.amount)}
                </p>
                <span className={r.paid ? 'badge-paid' : 'badge-unpaid'}>
                  {r.paid ? '✓ Paid' : '○ Due'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Debtors */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', margin: 0 }}>Highest Pending</p>
            <Link to="/payments" style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              Settle →
            </Link>
          </div>
          {topDebtors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: '0.82rem' }}>
              🎉 Koi pending nahi — sab clear!
            </div>
          ) : topDebtors.map(c => (
            <Link key={c._id} to={`/customers/${c._id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 8px', borderBottom: '1px solid var(--border)', borderRadius: 8,
                transition: 'background 0.15s', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.84rem', margin: '0 0 2px' }}>{c.name}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.72rem', margin: 0 }}>{c.phone}</p>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.95rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmt(c.totalDue)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}