import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Trending.css";

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/posts?type=popular");
        console.log("Fetched posts:", res.data);

        // Make sure it's always an array
        const actualPosts = Array.isArray(res.data) ? res.data : res.data.posts;
        setPosts(actualPosts || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load trending posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  if (loading) return <div className="p-4 text-lg">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">🔥 Trending Posts</h1>
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow-md rounded-2xl p-5 mb-6 border border-gray-200"
        >
          {/* User Info */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-semibold">
              @{post.userName}
            </span>
            <span className="text-xs text-gray-400">
              {post.commentCount} comments
            </span>
          </div>

          {/* Post Content */}
          <div className="text-base font-medium text-gray-900 mb-4">
            {post.content}
          </div>

          {/* Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-semibold text-gray-600 mb-2">
                Comments:
              </div>
              {post.comments.map((comment, index) => (
                <div key={index} className="text-sm text-gray-700 mb-1 pl-2">
                  💬 {comment.content}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrendingPosts;
