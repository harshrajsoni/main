import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../store/slice/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CollegeSignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    collegeName: '',
    collegeMembers: [{ name: '', email: '', password: '', role: 'admin' }]
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.user);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCollegeUserChange = (index, field, value) => {
    const members = [...form.collegeMembers];
    members[index][field] = value;
    setForm({ ...form, collegeMembers: members });
  };
  const addCollegeMember = () => {
    setForm({
      ...form,
      collegeMembers: [...form.collegeMembers, { name: '', email: '', password: '', role: 'non-admin' }],
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const { collegeMembers, collegeName, name, ...rest } = form;
    const collegeNameToUse = name || collegeName; // Use collegeName if name is empty
    dispatch(signupUser({ userType: 'college', ...rest, name: collegeNameToUse, collegeName, members: collegeMembers }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Signup successful! Please login.');
      navigate('/login/college-login');
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">College Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" name="email" placeholder="Email" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.password} onChange={handleChange} required />
          <input type="text" name="collegeName" placeholder="College Name" className="input w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.collegeName} onChange={handleChange} required />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">College Members</h3>
            {form.collegeMembers.map((member, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2">
                <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleCollegeUserChange(idx, 'name', e.target.value)} className="input px-2 py-2 border rounded" />
                <input type="email" placeholder="Email" value={member.email} onChange={(e) => handleCollegeUserChange(idx, 'email', e.target.value)} className="input px-2 py-2 border rounded" />
                <input type="password" placeholder="Password" value={member.password} onChange={(e) => handleCollegeUserChange(idx, 'password', e.target.value)} className="input px-2 py-2 border rounded" />
                <select value={member.role} onChange={(e) => handleCollegeUserChange(idx, 'role', e.target.value)} className="input px-2 py-2 border rounded">
                  <option value="admin">Admin</option>
                  <option value="non-admin">Non-Admin</option>
                </select>
              </div>
            ))}
            <button type="button" onClick={addCollegeMember} className="text-blue-600 underline">+ Add Person</button>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded w-full font-semibold text-lg hover:bg-blue-700 transition">Register</button>
          {loading && <p className="text-blue-500">Signing up...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
} 