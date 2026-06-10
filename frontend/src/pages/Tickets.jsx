import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Tickets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
  });
  const [editValues, setEditValues] = useState({});
  const [assignValues, setAssignValues] = useState({});
  const canManageTickets =
    user?.role === "admin" || user?.role === "it_staff";
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const fetchTickets = async () => {
    const response = await api.get("/tickets/");
    setTickets(response.data);
    const initialEdits = {};
    const initialAssigns = {};
    response.data.forEach((ticket) => {
      initialEdits[ticket.id] = {
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
      };
      initialAssigns[ticket.id] = ticket.assigned_to || "";
    });
    setEditValues(initialEdits);
    setAssignValues(initialAssigns);
  };
  useEffect(() => {
    const loadPage = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data);
        await fetchTickets();
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    loadPage();
  }, [navigate]);
  const handleTicketFormChange = (event) => {
    setTicketForm({
      ...ticketForm,
      [event.target.name]: event.target.value,
    });
  };
  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/tickets/", ticketForm);
      setTickets([response.data, ...tickets]);
      setTicketForm({
        title: "",
        description: "",
        priority: "Medium",
      });
      setSuccess(
        `Ticket created successfully. ML predicted category: ${response.data.category}`
      );
      await fetchTickets();
    } catch (err) {
      setError("Failed to create ticket.");
    }
  };
  const handleEditChange = (ticketId, field, value) => {
    setEditValues({
      ...editValues,
      [ticketId]: {
        ...editValues[ticketId],
        [field]: value,
      },
    });
  };
  const handleUpdateTicket = async (ticketId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/tickets/${ticketId}`, editValues[ticketId]);
      setSuccess("Ticket updated successfully.");
      await fetchTickets();
    } catch (err) {
      setError("Failed to update ticket. Only IT staff or admin can update tickets.");
    }
  };
  const handleAssignChange = (ticketId, value) => {
    setAssignValues({
      ...assignValues,
      [ticketId]: value,
    });
  };
  const handleAssignTicket = async (ticketId) => {
    setError("");
    setSuccess("");
    const assignedTo = Number(assignValues[ticketId]);
    if (!assignedTo) {
      setError("Please enter a valid staff/admin user ID.");
      return;
    }
    try {
      await api.patch(`/tickets/${ticketId}/assign`, {
        assigned_to: assignedTo,
      });
      setSuccess("Ticket assigned successfully.");
      await fetchTickets();
    } catch (err) {
      setError("Failed to assign ticket. Use a valid IT staff/admin user ID.");
    }
  };
  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div>
          <h2>Smart IT Helpdesk</h2>
          <p>Manage support tickets and ML-predicted issue categories</p>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate("/dashboard")} className="secondary-btn">
            Dashboard
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <section className="welcome-card">
        <h1>Tickets</h1>
        <p>
          Create support tickets, track status, and view automatic ML-based
          category prediction.
        </p>
        {user && (
          <p>
            Logged in as <strong>{user.full_name}</strong> — Role:{" "}
            <strong>{user.role}</strong>
          </p>
        )}
      </section>
      {error && <div className="error-message dashboard-error">{error}</div>}
      {success && <div className="success-message dashboard-error">{success}</div>}
      <section className="ticket-form-card">
        <h2>Create New Ticket</h2>
        <form onSubmit={handleCreateTicket}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={ticketForm.title}
            onChange={handleTicketFormChange}
            placeholder="Example: Cannot connect to WiFi"
            required
          />
          <label>Description</label>
          <textarea
            name="description"
            value={ticketForm.description}
            onChange={handleTicketFormChange}
            placeholder="Describe the issue in detail..."
            rows="4"
            required
          />
          <label>Priority</label>
          <select
            name="priority"
            value={ticketForm.priority}
            onChange={handleTicketFormChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <button type="submit">Create Ticket</button>
        </form>
      </section>
      <section className="table-card">
        <h2>Ticket List</h2>
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Assigned To</th>
                  {canManageTickets && <th>Update</th>}
                  {canManageTickets && <th>Assign</th>}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>
                      <strong>{ticket.title}</strong>
                      <p className="table-description">{ticket.description}</p>
                    </td>
                    <td>
                      {canManageTickets ? (
                        <select
                          value={editValues[ticket.id]?.category || ticket.category}
                          onChange={(event) =>
                            handleEditChange(
                              ticket.id,
                              "category",
                              event.target.value
                            )
                          }
                        >
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                          <option value="Network">Network</option>
                          <option value="Account Access">Account Access</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="badge">{ticket.category}</span>
                      )}
                    </td>
                    <td>
                      {canManageTickets ? (
                        <select
                          value={editValues[ticket.id]?.priority || ticket.priority}
                          onChange={(event) =>
                            handleEditChange(
                              ticket.id,
                              "priority",
                              event.target.value
                            )
                          }
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      ) : (
                        ticket.priority
                      )}
                    </td>
                    <td>
                      {canManageTickets ? (
                        <select
                          value={editValues[ticket.id]?.status || ticket.status}
                          onChange={(event) =>
                            handleEditChange(
                              ticket.id,
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        ticket.status
                      )}
                    </td>
                    <td>{ticket.created_by}</td>
                    <td>{ticket.assigned_to || "Unassigned"}</td>
                    {canManageTickets && (
                      <td>
                        <button
                          className="small-btn"
                          onClick={() => handleUpdateTicket(ticket.id)}
                        >
                          Save
                        </button>
                      </td>
                    )}
                    {canManageTickets && (
                      <td>
                        <div className="assign-box">
                          <input
                            type="number"
                            value={assignValues[ticket.id] || ""}
                            onChange={(event) =>
                              handleAssignChange(ticket.id, event.target.value)
                            }
                            placeholder="Staff ID"
                          />
                          <button
                            className="small-btn"
                            onClick={() => handleAssignTicket(ticket.id)}
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
export default Tickets;