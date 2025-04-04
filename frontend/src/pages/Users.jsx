import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Users.css"; // Add this line for external styling

function TopUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/users")
      .then((res) => {
        setUsers(res.data); // already top 5 from backend
      })
      .catch((err) => {
        console.error("Failed to load users", err);
      });
  }, []);

  return (
    <div className="container">
      <h2 className="title">Top 5 Users</h2>
      <ul className="user-list">
        {users.map((user, idx) => (
          <li key={user.id || idx} className="user-card">
            <div className="user-info">
              <strong>
                {idx + 1}. {user.name}
              </strong>
              <span>{user.postCount} posts</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopUsers;
