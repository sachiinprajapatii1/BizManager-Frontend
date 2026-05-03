// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, user }     = useAuth();
  const navigate            = useNavigate();

  if (user) { navigate('/'); return null; }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LOGIN BUTTON DABAYA GAYA!"); // Ye check karne ke liye
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      console.log("AXIOS_ERROR_DETAIL:", err.response || err); 
  toast.error(err.response?.data?.message || 'Login failed'); // Taaki screen pe error dikhe
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--green-glow)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 14px',
          }}>🏪</div>
          <h1 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.6rem', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            BizManager
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>
            Apne business mein login karo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              placeholder="aapka@email.com" className="input" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPwd ? 'text' : 'password'} required
                value={form.password} onChange={handleChange}
                placeholder="••••••••" className="input" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
                fontSize: '0.9rem',
              }}>{showPwd ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Login ho raha hai...' : 'Login karo →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text2)', marginTop: 20 }}>
          Account nahi hai?{' '}
          <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            Register karo
          </Link>
        </p>
      </div>
    </div>
  );
}