import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      
      login(user, accessToken);
      success(`Welcome back, ${user.name}!`);
      
      // Redirect based on role
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-2xl w-full max-w-md shadow-xl mx-auto my-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-bold text-3xl">
          S
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Suncity ERP</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-9" 
              placeholder="admin@suncity.com" 
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-9" 
              placeholder="••••••••" 
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-2.5">
          {isLoading ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-500">
          Are you a new student?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
