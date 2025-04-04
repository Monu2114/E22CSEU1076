import React, { useEffect, useState } from "react";
import axios from "axios";

const LatestPostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/posts?type=latest");
        setPosts(res.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load latest posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  if (loading) return <div className="p-4 text-lg">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">📸 Latest Posts</h1>
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow-md rounded-2xl p-4 mb-6 border border-gray-200"
        >
          <div className="mb-2 text-sm text-gray-600 font-semibold">
            @{post.userName}
          </div>
          <div className="text-base mb-4">{post.content}</div>

          <img
            src={"/nature1.jpg"}
            alt={post.content}
            className="rounded-lg mb-4 w-full object-cover h-64"
          />

          <div className="text-sm text-gray-500 mb-2">
            💬 {post.commentCount}{" "}
            {post.commentCount === 1 ? "comment" : "comments"}
          </div>

          {post.comments && post.comments.length > 0 && (
            <div className="bg-gray-50 p-2 rounded-md">
              {post.comments.map((comment, index) => (
                <div key={index} className="text-sm text-gray-700 mb-1">
                  - {comment.content}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button className="text-blue-500">Like</button>
            <button className="text-blue-500">Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LatestPostsFeed;
