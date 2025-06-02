import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    setPosts(storedPosts);
  }, []);

  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: (post.likes || 0) + 1 };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  return (
    <div className="home">
      <h1>Recent Posts</h1>
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h2>{post.title}</h2>
            <p>{post.content.substring(0, 150)}...</p>
            <div className="post-meta">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <button onClick={() => handleLike(post.id)} className="like-button">
                ❤️ {post.likes || 0}
              </button>
            </div>
            <Link to={`/post/${post.id}`} className="read-more">
              Read More
            </Link>
          </div>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="no-posts">No posts yet. Be the first to create one!</p>
      )}
    </div>
  );
}

export default Home; 