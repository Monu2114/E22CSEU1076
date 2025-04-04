require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors"); // ✅ this way
const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:3000", // or whatever your frontend runs on
    credentials: true,
  })
);
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

const BEARER_TOKEN = process.env.BEARER_TOKEN;
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
};

// fetching top users

app.get("/users", async (req, res) => {
  try {
    const token = await getToken();

    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const users = Object.entries(usersRes.data.users).map(([id, name]) => ({
      id,
      name,
    }));

    const userPostCounts = await Promise.all(
      users.map(async (user) => {
        try {
          const postsRes = await axios.get(
            `${API_BASE}/users/${user.id}/posts`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const postCount = Array.isArray(postsRes.data.posts)
            ? postsRes.data.posts.length
            : 0;

          console.log(`User ${user.name} has ${postCount} posts`);

          return {
            userId: user.id,
            name: user.name,
            postCount,
          };
        } catch (err) {
          console.error(
            `Error fetching posts for user ${user.id}:`,
            err.message
          );
          return {
            userId: user.id,
            name: user.name,
            postCount: 0,
          };
        }
      })
    );

    const topUsers = userPostCounts
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);

    res.json(topUsers);
  } catch (err) {
    console.error("TOP USERS ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get top users" });
  }
});

// posts and comments
app.get("/posts", async (req, res) => {
  const type = req.query.type;

  if (!type || !["popular", "latest"].includes(type)) {
    return res.status(400).json({ error: "Invalid or missing type parameter" });
  }

  try {
    const token = await getToken();

    // Step 1: Get all users
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Convert users object to array of { id, name }
    const users = Object.entries(usersRes.data.users).map(([id, name]) => ({
      id,
      name,
    }));

    let allPosts = [];

    // Step 2: Fetch posts for each user and store them in allPosts
    for (const user of users) {
      try {
        const postsRes = await axios.get(`${API_BASE}/users/${user.id}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const posts = postsRes.data.posts || [];

        // Attach user info to each post
        const postsWithUser = posts.map((post) => ({
          ...post,
          userId: user.id,
          userName: user.name,
        }));

        allPosts.push(...postsWithUser);
      } catch (err) {
        console.error(`Error fetching posts for user ${user.id}:`, err.message);
        // continue with other users
      }
    }

    // Handle "latest"
    if (type === "latest") {
      const latestPosts = allPosts
        .sort((a, b) => b.id - a.id) // Assuming higher ID is newer
        .slice(0, 5);

      return res.json(latestPosts);
    }

    // Handle "popular"
    const postsWithComments = await Promise.all(
      allPosts.map(async (post) => {
        try {
          const commentsRes = await axios.get(
            `${API_BASE}/posts/${post.id}/comments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const commentData = commentsRes.data.comments;
          return {
            ...post,
            commentCount: commentData.length,
            comments: commentData.map((c) => ({ content: c.content })),
          };
        } catch (err) {
          console.error(
            `Failed to get comments for post ${post.id}:`,
            err.message
          );
          return { ...post, commentCount: 0 };
        }
      })
    );

    const popularPosts = postsWithComments
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 5);

    return res.json(popularPosts);
  } catch (err) {
    console.error("Error fetching posts:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
