// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = [
  { value: 'milkman', label: '🥛 Milkman'     },
  { value: 'barber',  label: '✂️ Barber / Salon' },
  { value: 'kirana',  label: '🏪 Kirana Store' },
  { value: 'other',   label: '💼 Other'        },
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', businessType: 'other', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register, user }    = useAuth();
  const navigate              = useNavigate();

  if (user) { navigate('/'); return null; }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password 6+ characters ka hona chahiye'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account ban gaya! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: '36px', width: '100%', maxWidth: 440,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--green-glow)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 12px',
          }}>🏪</div>
          <h1 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.5rem', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Account banao
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>Apna business register karo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="label">Aapka Naam *</label>
              <input name="name" required value={form.name} onChange={handleChange}
                placeholder="Ramesh Kumar" className="input" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="ramesh@gmail.com" className="input" />
            </div>
            <div>
              <label className="label">Password *</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                placeholder="Min 6 characters" className="input" />
            </div>
            <div>
              <label className="label">Business ka Naam</label>
              <input name="businessName" value={form.businessName} onChange={handleChange}
                placeholder="Ramesh Dairy / Sharma Salon" className="input" />
            </div>
            <div>
              <label className="label">Business Type</label>
              <select name="businessType" value={form.businessType} onChange={handleChange} className="input">
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Phone (Optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210" className="input" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 24 }}>
            {loading ? 'Account ban raha hai...' : 'Register karo 🚀'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text2)', marginTop: 18 }}>
          Pehle se account hai?{' '}
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            Login karo
          </Link>
        </p>
      </div>
    </div>
  );
}