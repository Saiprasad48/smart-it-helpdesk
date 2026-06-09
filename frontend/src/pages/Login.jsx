import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "sai@example.com",
    password: "Password123",
  });

  const [error, setError] = useState("");
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", formData.email);
      params.append("password", formData.password);
      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Smart IT Helpdesk</h1>
        <p className="subtitle">Login to manage support tickets and assets</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="auth-link">
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;