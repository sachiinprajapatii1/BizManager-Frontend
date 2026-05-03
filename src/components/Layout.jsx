import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: '⊞', label: 'Dashboard' },
  { to: '/customers', icon: '◎', label: 'Customers' },
  { to: '/records', icon: '◈', label: 'Records' },
  { to: '/payments', icon: '◐', label: 'Payments' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logout ho gaye!');
    navigate('/login');
  };

  const bizTypeMap = {
    milkman: '🥛',
    barber: '✂️',
    kirana: '🏪',
    other: '💼',
  };

  const biz = bizTypeMap[user?.businessType] || '💼';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          position: 'fixed',
          inset: '0 auto 0 0',
          flexDirection: 'column',
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--green-glow)',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            {biz}
          </div>

          <p
            style={{
              fontWeight: 700,
              color: 'var(--text)',
              fontSize: '0.9rem',
            }}
          >
            {user?.businessName || 'BizManager'}
          </p>

          <p
            style={{
              color: 'var(--text3)',
              fontSize: '0.7rem',
              textTransform: 'capitalize',
            }}
          >
            {user?.businessType}
          </p>
        </div>

        {/* Sidebar Nav */}
        <nav
          style={{
            flex: 1,
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: '0.83rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--green)' : 'var(--text2)',
                background: isActive ? 'var(--green-glow)' : 'transparent',
                border: isActive
                  ? '1px solid rgba(34,197,94,0.15)'
                  : '1px solid transparent',
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{user?.name}</p>
          <p
            style={{
              fontSize: '0.68rem',
              color: 'var(--text3)',
              marginBottom: 10,
            }}
          >
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: '0.75rem',
              color: 'var(--red)',
              background: 'rgba(248,113,113,0.07)',
              border: '1px solid rgba(248,113,113,0.15)',
              cursor: 'pointer',
            }}
          >
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-[220px] pb-20 md:pb-0" style={{ flex: 1 }}>
        
        {/* Mobile Header */}
        <header
          className="md:hidden"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <span>{biz}</span>
            <span>{user?.businessName || 'BizManager'}</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              color: 'var(--red)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="flex md:hidden"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          justifyContent: 'space-around',
          padding: '6px 0 8px',
        }}
      >
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 8px',
              textDecoration: 'none',
              color: isActive ? 'var(--green)' : 'var(--text3)',
            })}
          >
            <span style={{ fontSize: '1.3rem' }}>{icon}</span>
            <span style={{ fontSize: '0.6rem' }}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}