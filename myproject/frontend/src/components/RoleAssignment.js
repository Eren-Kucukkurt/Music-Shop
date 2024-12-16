import React, { useState } from "react";
import axios from "axios";
import "./RoleAssignment.css"; // Optional for styling

const RoleAssignment = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Reset message
    setError(null);   // Reset error

    const token = sessionStorage.getItem("access_token"); // Admin token
    if (!token) {
      setError("Unauthorized. Please log in as an admin.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/assign-role/",
        { username, role },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      setUsername(""); // Clear inputs after success
      setRole("");
    } catch (err) {
      console.error("Error assigning role:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "An error occurred.");
      } else {
        setError("Unable to assign role. Please try again.");
      }
    }
  };

  return (
    <div className="role-assignment-container">
      <h2>Admin Role Assignment</h2>
      <form onSubmit={handleSubmit} className="role-assignment-form">
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter the username"
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select a role</option>
            <option value="PRODUCT_MANAGER">Product Manager</option>
            <option value="SALES_MANAGER">Sales Manager</option>
          </select>
        </div>
        <button type="submit">Assign Role</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default RoleAssignment;
