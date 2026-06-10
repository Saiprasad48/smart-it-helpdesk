import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data);
        if (
          userResponse.data.role === "admin" ||
          userResponse.data.role === "it_staff"
        ) {
          const summaryResponse = await api.get("/analytics/summary");
          setSummary(summaryResponse.data);
        }
      } catch (err) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
      }
    };
    fetchData();
  }, []);
  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div>
          <h2>Smart IT Helpdesk</h2>
          <p>Ticketing, assets, and support analytics</p>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate("/tickets")} className="secondary-btn">
            Tickets
          </button>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      {error && <div className="error-message dashboard-error">{error}</div>}
      {user && (
        <section className="welcome-card">
          <h1>Welcome, {user.full_name}</h1>
          <p>
            Role: <strong>{user.role}</strong>
          </p>
        </section>
      )}
      {summary ? (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <h3>Total Tickets</h3>
              <p>{summary.total_tickets}</p>
            </div>
            <div className="stat-card">
              <h3>Open Tickets</h3>
              <p>{summary.open_tickets}</p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p>{summary.in_progress_tickets}</p>
            </div>
            <div className="stat-card">
              <h3>Closed Tickets</h3>
              <p>{summary.closed_tickets}</p>
            </div>
            <div className="stat-card">
              <h3>Total Assets</h3>
              <p>{summary.total_assets}</p>
            </div>
            <div className="stat-card">
              <h3>Assigned Assets</h3>
              <p>{summary.assigned_assets}</p>
            </div>
          </section>
          <section className="summary-section">
            <div className="summary-card">
              <h3>Tickets by Category</h3>
              {summary.tickets_by_category.map((item) => (
                <p key={item.name}>
                  {item.name}: <strong>{item.count}</strong>
                </p>
              ))}
            </div>
            <div className="summary-card">
              <h3>Tickets by Priority</h3>
              {summary.tickets_by_priority.map((item) => (
                <p key={item.name}>
                  {item.name}: <strong>{item.count}</strong>
                </p>
              ))}
            </div>
            <div className="summary-card">
              <h3>Assets by Status</h3>
              {summary.assets_by_status.map((item) => (
                <p key={item.name}>
                  {item.name}: <strong>{item.count}</strong>
                </p>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="welcome-card">
          <h2>Student Dashboard</h2>
          <p>
            You can create support tickets and view assets assigned to your
            account. Ticket and asset pages will be added next.
          </p>
        </section>
      )}
    </div>
  );
}
export default Dashboard;