import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../store/slice/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function StudentSignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    college: '',
    course: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupUser({
      userType: 'student',
      ...form
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Signup successful!");
      navigate("/student-dashboard");
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Student Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" name="name" placeholder="Name" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.password} onChange={handleChange} required />
          <input type="text" name="rollNo" placeholder="Roll No" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.rollNo} onChange={handleChange} required />
          <input type="text" name="college" placeholder="College" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.college} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.course} onChange={handleChange} required />
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-3 rounded w-full font-semibold text-lg hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
