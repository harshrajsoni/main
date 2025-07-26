import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CollegeLoginPage() {
  const [form, setForm] = useState({
    college_email: "",
    college_password: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({
        userType: "college",
        ...form,
      })
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful!");
      navigate("/college-dashboard"); // Change to your desired route
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto mt-8">
      <input
        type="email"
        name="college_email"
        placeholder="College Email"
        className="input w-full px-4 py-3 border rounded"
        value={form.college_email}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        type="password"
        name="college_password"
        placeholder="College Password"
        className="input w-full px-4 py-3 border rounded"
        value={form.college_password}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        type="email"
        name="email"
        placeholder="Member Email"
        className="input w-full px-4 py-3 border rounded"
        value={form.email}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        type="password"
        name="password"
        placeholder="Member Password"
        className="input w-full px-4 py-3 border rounded"
        value={form.password}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-3 rounded w-full font-semibold text-lg hover:bg-purple-700 transition"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
