import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Assets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assetForm, setAssetForm] = useState({
    asset_tag: "",
    asset_type: "Laptop",
    brand: "",
    model: "",
    serial_number: "",
    status: "Active",
  });
  const [editValues, setEditValues] = useState({});
  const [assignValues, setAssignValues] = useState({});
  const canManageAssets =
    user?.role === "admin" || user?.role === "it_staff";
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const getUserName = (userId) => {
    const foundUser = users.find((item) => item.id === userId);
    return foundUser ? `${foundUser.full_name} (${foundUser.role})` : userId;
  };
  const fetchAssets = async () => {
    const response = await api.get("/assets/");
    setAssets(response.data);
    const initialEdits = {};
    const initialAssigns = {};
    response.data.forEach((asset) => {
      initialEdits[asset.id] = {
        asset_type: asset.asset_type,
        brand: asset.brand || "",
        model: asset.model || "",
        serial_number: asset.serial_number || "",
        status: asset.status,
      };
      initialAssigns[asset.id] = asset.assigned_to || "";
    });
    setEditValues(initialEdits);
    setAssignValues(initialAssigns);
  };
  useEffect(() => {
    const loadPage = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data);
        if (
          userResponse.data.role === "admin" ||
          userResponse.data.role === "it_staff"
        ) {
          const usersResponse = await api.get("/users/");
          setUsers(usersResponse.data);
        } else {
          setUsers([userResponse.data]);
        }
        await fetchAssets();
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    loadPage();
  }, [navigate]);
  const handleAssetFormChange = (event) => {
    setAssetForm({
      ...assetForm,
      [event.target.name]: event.target.value,
    });
  };
  const handleCreateAsset = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/assets/", {
        ...assetForm,
        brand: assetForm.brand || null,
        model: assetForm.model || null,
        serial_number: assetForm.serial_number || null,
      });
      setAssetForm({
        asset_tag: "",
        asset_type: "Laptop",
        brand: "",
        model: "",
        serial_number: "",
        status: "Active",
      });
      setSuccess("Asset created successfully.");
      await fetchAssets();
    } catch (err) {
      setError("Failed to create asset. Asset tag or serial number may already exist.");
    }
  };
  const handleEditChange = (assetId, field, value) => {
    setEditValues({
      ...editValues,
      [assetId]: {
        ...editValues[assetId],
        [field]: value,
      },
    });
  };
  const handleUpdateAsset = async (assetId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/assets/${assetId}`, {
        ...editValues[assetId],
        brand: editValues[assetId].brand || null,
        model: editValues[assetId].model || null,
        serial_number: editValues[assetId].serial_number || null,
      });
      setSuccess("Asset updated successfully.");
      await fetchAssets();
    } catch (err) {
      setError("Failed to update asset. Only IT staff or admin can update assets.");
    }
  };
  const handleAssignChange = (assetId, value) => {
    setAssignValues({
      ...assignValues,
      [assetId]: value,
    });
  };
  const handleAssignAsset = async (assetId) => {
    setError("");
    setSuccess("");
    const assignedTo = Number(assignValues[assetId]);
    if (!assignedTo) {
      setError("Please select a user.");
      return;
    }
    try {
      await api.patch(`/assets/${assetId}/assign`, {
        assigned_to: assignedTo,
      });
      setSuccess("Asset assigned successfully.");
      await fetchAssets();
    } catch (err) {
      setError("Failed to assign asset. Please select a valid user.");
    }
  };
  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div>
          <h2>Smart IT Helpdesk</h2>
          <p>Manage IT assets, assignments, and device status</p>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate("/dashboard")} className="secondary-btn">
            Dashboard
          </button>
          <button onClick={() => navigate("/tickets")} className="secondary-btn">
            Tickets
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <section className="welcome-card">
        <h1>Assets</h1>
        <p>
          Track laptops, monitors, devices, and user assignments from one place.
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
      {canManageAssets && (
        <section className="ticket-form-card">
          <h2>Add New Asset</h2>
          <form onSubmit={handleCreateAsset}>
            <label>Asset Tag</label>
            <input
              type="text"
              name="asset_tag"
              value={assetForm.asset_tag}
              onChange={handleAssetFormChange}
              placeholder="Example: OU-LAP-002"
              required
            />
            <label>Asset Type</label>
            <select
              name="asset_type"
              value={assetForm.asset_type}
              onChange={handleAssetFormChange}
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="Printer">Printer</option>
              <option value="Other">Other</option>
            </select>
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={assetForm.brand}
              onChange={handleAssetFormChange}
              placeholder="Example: Dell"
            />
            <label>Model</label>
            <input
              type="text"
              name="model"
              value={assetForm.model}
              onChange={handleAssetFormChange}
              placeholder="Example: Latitude 5420"
            />
            <label>Serial Number</label>
            <input
              type="text"
              name="serial_number"
              value={assetForm.serial_number}
              onChange={handleAssetFormChange}
              placeholder="Example: SN-LAP-002"
            />
            <label>Status</label>
            <select
              name="status"
              value={assetForm.status}
              onChange={handleAssetFormChange}
            >
              <option value="Active">Active</option>
              <option value="Assigned">Assigned</option>
              <option value="Damaged">Damaged</option>
              <option value="Retired">Retired</option>
            </select>
            <button type="submit">Create Asset</button>
          </form>
        </section>
      )}
      <section className="table-card">
        <h2>{canManageAssets ? "Asset Inventory" : "My Assigned Assets"}</h2>
        {assets.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asset Tag</th>
                  <th>Type</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  {canManageAssets && <th>Update</th>}
                  {canManageAssets && <th>Assign</th>}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>
                      <strong>{asset.asset_tag}</strong>
                    </td>
                    <td>
                      {canManageAssets ? (
                        <select
                          value={editValues[asset.id]?.asset_type || asset.asset_type}
                          onChange={(event) =>
                            handleEditChange(asset.id, "asset_type", event.target.value)
                          }
                        >
                          <option value="Laptop">Laptop</option>
                          <option value="Desktop">Desktop</option>
                          <option value="Monitor">Monitor</option>
                          <option value="Keyboard">Keyboard</option>
                          <option value="Mouse">Mouse</option>
                          <option value="Printer">Printer</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        asset.asset_type
                      )}
                    </td>
                    <td>
                      {canManageAssets ? (
                        <input
                          type="text"
                          value={editValues[asset.id]?.brand || ""}
                          onChange={(event) =>
                            handleEditChange(asset.id, "brand", event.target.value)
                          }
                        />
                      ) : (
                        asset.brand || "-"
                      )}
                    </td>
                    <td>
                      {canManageAssets ? (
                        <input
                          type="text"
                          value={editValues[asset.id]?.model || ""}
                          onChange={(event) =>
                            handleEditChange(asset.id, "model", event.target.value)
                          }
                        />
                      ) : (
                        asset.model || "-"
                      )}
                    </td>
                    <td>
                      {canManageAssets ? (
                        <input
                          type="text"
                          value={editValues[asset.id]?.serial_number || ""}
                          onChange={(event) =>
                            handleEditChange(
                              asset.id,
                              "serial_number",
                              event.target.value
                            )
                          }
                        />
                      ) : (
                        asset.serial_number || "-"
                      )}
                    </td>
                    <td>
                      {canManageAssets ? (
                        <select
                          value={editValues[asset.id]?.status || asset.status}
                          onChange={(event) =>
                            handleEditChange(asset.id, "status", event.target.value)
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Retired">Retired</option>
                        </select>
                      ) : (
                        <span className="badge">{asset.status}</span>
                      )}
                    </td>
                    <td>
                      {asset.assigned_to
                        ? getUserName(asset.assigned_to)
                        : "Unassigned"}
                    </td>
                    {canManageAssets && (
                      <td>
                        <button
                          className="small-btn"
                          onClick={() => handleUpdateAsset(asset.id)}
                        >
                          Save
                        </button>
                      </td>
                    )}
                    {canManageAssets && (
                      <td>
                        <div className="assign-box">
                          <select
                            value={assignValues[asset.id] || ""}
                            onChange={(event) =>
                              handleAssignChange(asset.id, event.target.value)
                            }
                          >
                            <option value="">Select user</option>
                            {users.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.full_name} — {item.role}
                              </option>
                            ))}
                          </select>
                          <button
                            className="small-btn"
                            onClick={() => handleAssignAsset(asset.id)}
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
export default Assets;