import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const normalizeEmail = (email) => email.trim().toLowerCase();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email: normalizeEmail(email), password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    toast.success('Welcome back!');
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', {
      name: name.trim(),
      email: normalizeEmail(email),
      password,
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    toast.success('Account created!');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
