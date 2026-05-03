import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#18181c',
              color: '#f0f0f4',
              border: '1px solid #2e2e38',
              fontFamily: 'Sora, sans-serif',
              fontSize: '0.84rem',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a1f12' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#2d0a0a' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);