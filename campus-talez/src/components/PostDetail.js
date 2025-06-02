import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const foundPost = posts.find(p => p.id === parseInt(id));
    if (foundPost) {
      setPost(foundPost);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      content: comment,
      date: new Date().toISOString()
    };

    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = posts.map(p => {
      if (p.id === parseInt(id)) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    });

    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPost(updatedPosts.find(p => p.id === parseInt(id)));
    setComment('');
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail">
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        <span>❤️ {post.likes || 0} likes</span>
      </div>
      <div className="post-content">
        {post.content}
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit">Add Comment</button>
        </form>

        <div className="comments-list">
          {post.comments && post.comments.map(comment => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
              <span className="comment-date">
                {new Date(comment.date).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(!post.comments || post.comments.length === 0) && (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail; 