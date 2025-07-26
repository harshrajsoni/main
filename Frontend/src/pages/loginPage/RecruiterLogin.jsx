import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function RecruiterLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({
        userType: "recruiter",
        email: form.email,
        password: form.password,
      })
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful!");
      navigate("/recruiter-dashboard"); // Change to your desired route
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
        name="email"
        placeholder="Email"
        className="input w-full px-4 py-3 border rounded"
        value={form.email}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="input w-full px-4 py-3 border rounded"
        value={form.password}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-3 rounded w-full font-semibold text-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}