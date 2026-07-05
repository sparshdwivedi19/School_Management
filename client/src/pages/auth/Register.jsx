import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Calendar, Users, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    class: '1',
    section: 'A',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register-student', formData);
      const { user, accessToken } = res.data.data;
      
      login(user, accessToken);
      success('Registration successful! Welcome to Suncity.');
      navigate('/');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-2xl w-full max-w-lg shadow-xl mx-auto my-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
          <UserPlus className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Registration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Create your student portal account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-9" placeholder="Student Name" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Father's Name</label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="input-field pl-9" placeholder="Father's Name" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field pl-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
            <select name="class" value={formData.class} onChange={handleChange} className="input-field">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
            <select name="section" value={formData.section} onChange={handleChange} className="input-field">
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Account Details */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
          <div className="relative mb-4">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-9" placeholder="student@example.com" />
          </div>

          <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="input-field pl-9" placeholder="Create a strong password" minLength={6} />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-2.5">
          {isLoading ? 'Creating Account...' : 'Register as Student'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
