// // src/context/AuthContext.jsx
// import { createContext, useContext, useState, useEffect } from 'react';
// import api from '../api/axios';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user,    setUser]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   // App open hote hi check karo: cookie se user session valid hai?
//   useEffect(() => {
//     api.get('/api/auth/me')
//       .then(res => setUser(res.data.user))
//       .catch(()  => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email, password) => {
//     const res = await api.post('/api/auth/login', { email, password });
//     setUser(res.data.user);
//     return res.data.user;
//   };

//   const register = async (data) => {
//     const res = await api.post('/api/auth/register', data);
//     setUser(res.data.user);
//     return res.data.user;
//   };

//   const logout = async () => {
//     await api.post('/api/auth/logout');
//     setUser(null);
//   };

//   const updateUser = (updatedUser) => setUser(updatedUser);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be inside AuthProvider');
//   return ctx;
// };

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 App open → token check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔥 LOGIN FIX
const login = async (email, password) => {
  try {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  } catch (error) {
    console.error("Login Context Error:", error);
    throw error; // YE LINE ZAROORI HAI, iske bina frontend ko error nahi milega
  }
};

  // 🔥 REGISTER FIX
  // 🔥 FIX 3: try-catch added — error ab UI pe dikhega
  const register = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      console.error("Register Context Error:", error);
      throw error; // Zaroori hai — bina iske Register page ko error nahi milta
    }
  };

  // 🔥 LOGOUT FIX
  const logout = async () => {
    localStorage.removeItem("token"); // ✅ clear token
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};