import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../store/slice/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function RecruiterSignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyId: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.user);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupUser({ userType: 'recruiter', ...form }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Signup successful! Please login.');
      navigate('/login/recruiter-login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white px-6 py-10 flex items-center justify-center">
      <div className="max-w-lg w-full border rounded-2xl shadow-xl bg-white p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Recruiter Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" name="name" placeholder="Name" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.password} onChange={handleChange} required />
          <input type="text" name="companyName" placeholder="Company Name" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.companyName} onChange={handleChange} required />
          <input type="text" name="companyId" placeholder="Company ID" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.companyId} onChange={handleChange} required />
          <button type="submit" className="bg-black text-white px-4 py-3 rounded w-full font-semibold text-lg hover:opacity-90 transition">Register</button>
          {loading && <p className="text-blue-500">Signing up...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
} 