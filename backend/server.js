const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// In-memory storage
let users = {};
let posts = [];
let comments = {};

const API_BASE = "http://testserver.com/api"; // Replace with actual API URL

// Fetch data periodically (every 30s)
async function fetchData() {
  try {
    const [usersRes, postsRes, commentsRes] = await Promise.all([
      axios.get(`${API_BASE}/users`),
      axios.get(`${API_BASE}/posts`),
      axios.get(`${API_BASE}/comments`),
    ]);

    users = usersRes.data.reduce((acc, user) => {
      acc[user.id] = { ...user, postCount: 0 };
      return acc;
    }, {});

    posts = postsRes.data;
    comments = commentsRes.data.reduce((acc, comment) => {
      acc[comment.postId] = (acc[comment.postId] || 0) + 1;
      return acc;
    }, {});

    // Update user post count
    posts.forEach((post) => {
      if (users[post.userId]) users[post.userId].postCount++;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

setInterval(fetchData, 30000); // Refresh every 30s
fetchData();

// Top 5 Users with Most Posts
app.get("/users", (req, res) => {
  const topUsers = Object.values(users)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
  res.json(topUsers);
});

// Top/Latest Posts
app.get("/posts", (req, res) => {
  const { type } = req.query;
  let responsePosts = [];

  if (type === "popular") {
    responsePosts = posts.sort(
      (a, b) => (comments[b.id] || 0) - (comments[a.id] || 0)
    );
  } else {
    responsePosts = posts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }
  res.json(responsePosts);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
