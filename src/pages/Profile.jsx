// src/pages/Profile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'milkman', label: '🥛 Milkman'     },
  { value: 'barber',  label: '✂️ Barber / Salon' },
  { value: 'kirana',  label: '🏪 Kirana Store' },
  { value: 'other',   label: '💼 Other'        },
];

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 22 }}>
      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', margin: '0 0 18px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '', businessName: user?.businessName || '',
    businessType: user?.businessType || 'other', phone: user?.phone || '', address: user?.address || '',
  });
  const [pwd, setPwd]         = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving,    setSaving]    = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const setP = (e) => setProfile(f => ({ ...f, [e.target.name]: e.target.value }));
  const setW = (e) => setPwd(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/auth/profile', profile);
      updateUser(res.data.user);
      toast.success('Profile update ho gayi! ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwd.newPassword !== pwd.confirm) { toast.error('Passwords match nahi kar rahe'); return; }
    if (pwd.newPassword.length < 6) { toast.error('Password 6+ characters ka hona chahiye'); return; }
    setPwdSaving(true);
    try {
      await api.put('/api/auth/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password badal gaya! 🔐');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPwdSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logout ho gaye!');
    navigate('/login');
  };

  const biz = { milkman:'🥛', barber:'✂️', kirana:'🏪', other:'💼' }[user?.businessType] || '💼';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520, margin: '0 auto' }}>

      <div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>Profile</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>Apna account manage karo</p>
      </div>

      {/* Avatar card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface), rgba(34,197,94,0.05))',
        border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: 22,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: 'var(--green-glow)',
          border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0,
        }}>{biz}</div>
        <div>
          <p style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem', margin: '0 0 2px' }}>{user?.name}</p>
          <p style={{ color: 'var(--text2)', fontSize: '0.78rem', margin: '0 0 4px' }}>{user?.email}</p>
          <span style={{
            padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize',
            background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            {user?.businessType} · Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Edit Profile */}
      <Section title="Profile Edit karo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { name: 'name',         label: 'Naam',           placeholder: 'Ramesh Kumar'     },
            { name: 'businessName', label: 'Business Naam',  placeholder: 'Sharma Dairy'      },
            { name: 'phone',        label: 'Phone',          placeholder: '9876543210'        },
            { name: 'address',      label: 'Address',        placeholder: 'Aapka address'     },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input name={f.name} value={profile[f.name]} onChange={setP} placeholder={f.placeholder} className="input" />
            </div>
          ))}
          <div>
            <label className="label">Business Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setProfile(p => ({ ...p, businessType: t.value }))} style={{
                  padding: '10px 12px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: 'Sora, sans-serif',
                  background: profile.businessType === t.value ? 'var(--green-glow)' : 'var(--surface2)',
                  color: profile.businessType === t.value ? 'var(--green)' : 'var(--text2)',
                  border: profile.businessType === t.value ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                }}>{t.label}</button>
              ))}
            </div>
          </div>
          <button onClick={handleProfileSave} disabled={saving} className="btn-primary" style={{ width: '100%', padding: 11, marginTop: 4 }}>
            {saving ? 'Saving...' : 'Save karo'}
          </button>
        </div>
      </Section>

      {/* Password */}
      <Section title="🔐 Password Badlo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword',     label: 'New Password',     placeholder: 'Min 6 characters' },
            { name: 'confirm',         label: 'Confirm Password', placeholder: 'Dobara daalo' },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input name={f.name} type="password" value={pwd[f.name]} onChange={setW} placeholder={f.placeholder} className="input" />
            </div>
          ))}
          <button onClick={handlePasswordChange} disabled={pwdSaving} className="btn-secondary" style={{ width: '100%', padding: 11 }}>
            {pwdSaving ? 'Changing...' : 'Password Change karo'}
          </button>
        </div>
      </Section>

      {/* Logout */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 20, padding: 22 }}>
        <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Account</p>
        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: '0 0 16px' }}>Logout karne ke baad dobara login karna padega</p>
        <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', padding: 11 }}>
          ⎋ Logout karo
        </button>
      </div>
    </div>
  );
}