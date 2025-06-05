import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPost = {
      id: Date.now(),
      title,
      content,
      date: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = [newPost, ...existingPosts];
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    navigate('/');
  };

  return (
    <div className="create-post">
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your post content here..."
            rows="10"
          />
        </div>
        <button type="submit" className="submit-button">
          Publish Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost; 