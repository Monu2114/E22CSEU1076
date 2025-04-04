require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;
async function getToken() {
  try {
    const response = await axios.post(
      "http://20.244.56.144/evaluation-service/auth",
      {
        companyName: "Affordmed",
        clientID: "eca65a23-5dc6-4c62-8b1c-02b460d25c1a",
        clientSecret: "ntUWfNAMFwCWWDXJ",
        name: "monisha nanabala",
        email: "e22cseu1076@bennett.edu.in",
        rollNo: "e22cseu1076",
        accessCode: "rtCHZJ",
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Token error:", error.response?.data || error.message);
    throw new Error("Failed to fetch token");
  }
}

const API_BASE = "http://20.244.56.144/evaluation-service";

app.get("/top-users", async (req, res) => {
  try {
    const token = await getToken();

    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(usersRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
const BEARER_TOKEN = process.env.BEARER_TOKEN;
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
};
let users = {};
let posts = [];
let comments = {};

app.get("/users", async (req, res) => {
  try {
    const token = await getToken(); // get fresh token

    // Fetch users
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user_data = Object.entries(usersRes.data.users).map(([id, name]) => ({
      id,
      name,
    }));

    // For each user, fetch post count
    const userPostCounts = await Promise.all(
      user_data.map(async (user) => {
        try {
          const postsRes = await axios.get(
            `${API_BASE}/users/${user.id}/posts`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return {
            userId: user.id,
            name: user.name,
            postCount: postsRes.data.length,
          };
        } catch (err) {
          console.error(
            `Error fetching posts for user ${user.id}:`,
            err.message
          );
          return null;
        }
      })
    );

    const topUsers = userPostCounts
      .filter(Boolean)
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);

    res.json(topUsers);
  } catch (err) {
    console.error("TOP USERS ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get top users" });
  }
});
