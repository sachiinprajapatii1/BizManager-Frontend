// src/components/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      }} />

      {/* Box */}
      <div style={{
        position: 'relative', background: 'var(--surface)',
        border: '1px solid var(--border2)', borderRadius: 20,
        width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--border)', color: 'var(--text2)',
            fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}