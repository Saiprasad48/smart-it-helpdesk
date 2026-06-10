import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);
  const ticketStatusData = summary
    ? [
        { name: "Open", count: summary.open_tickets },
        { name: "In Progress", count: summary.in_progress_tickets },
        { name: "Resolved", count: summary.resolved_tickets },
        { name: "Closed", count: summary.closed_tickets },
      ]
    : [];
  const assetStatusData = summary
    ? [
        { name: "Active", count: summary.active_assets },
        { name: "Assigned", count: summary.assigned_assets },
        { name: "Damaged", count: summary.damaged_assets },
        { name: "Retired", count: summary.retired_assets },
      ]
    : [];
  const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed"];
  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div>
          <h2>Smart IT Helpdesk</h2>
          <p>Ticketing, assets, ML categorization, and support analytics</p>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate("/tickets")} className="secondary-btn">
            Tickets
          </button>
          <button onClick={() => navigate("/assets")} className="secondary-btn">
            Assets
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
          <section className="charts-grid">
            <div className="chart-card">
              <h3>Tickets by Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ticketStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Tickets by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={summary.tickets_by_category}
                    dataKey="count"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {summary.tickets_by_category.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Tickets by Priority</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={summary.tickets_by_priority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Assets by Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={assetStatusData}
                    dataKey="count"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {assetStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="summary-section">
            <div className="summary-card">
              <h3>Tickets by Category</h3>
              {summary.tickets_by_category.length === 0 ? (
                <p>No category data yet.</p>
              ) : (
                summary.tickets_by_category.map((item) => (
                  <p key={item.name}>
                    {item.name}: <strong>{item.count}</strong>
                  </p>
                ))
              )}
            </div>
            <div className="summary-card">
              <h3>Tickets by Priority</h3>
              {summary.tickets_by_priority.length === 0 ? (
                <p>No priority data yet.</p>
              ) : (
                summary.tickets_by_priority.map((item) => (
                  <p key={item.name}>
                    {item.name}: <strong>{item.count}</strong>
                  </p>
                ))
              )}
            </div>
            <div className="summary-card">
              <h3>Assets by Status</h3>
              {summary.assets_by_status.length === 0 ? (
                <p>No asset data yet.</p>
              ) : (
                summary.assets_by_status.map((item) => (
                  <p key={item.name}>
                    {item.name}: <strong>{item.count}</strong>
                  </p>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="welcome-card">
          <h2>Student Dashboard</h2>
          <p>
            You can create support tickets and view assets assigned to your
            account.
          </p>
          <div className="quick-actions">
            <button onClick={() => navigate("/tickets")}>Create Ticket</button>
            <button onClick={() => navigate("/assets")} className="secondary-btn">
              View My Assets
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
export default Dashboard;