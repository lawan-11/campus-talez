// Write Panel Functions
window.toggleWritePanel = () => {
    const panel = document.getElementById('writePanel');
    if (panel) {
        panel.classList.toggle('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const blogForm = document.getElementById('blogForm');
    const postsContainer = document.getElementById('posts-container');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchPosts');
    
    // Initialize marked for Markdown parsing
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        }
    });

    // Load existing posts from localStorage and ensure they have all required properties
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // Migrate old posts to include new properties if they don't exist
    posts = posts.map(post => ({
        likes: [],
        dislikes: [],
        comments: [],
        ...post // This spreads the existing post properties after the defaults
    }));
    
    // Save migrated posts back to localStorage
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Display existing posts
    displayPosts();
    
    // Text formatting functions
    window.formatText = (type) => {
        const textarea = document.getElementById('blogContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        let format = {
            bold: '**',
            italic: '_',
            code: '`'
        };
        
        const prefix = format[type];
        const suffix = format[type];
        
        textarea.value = text.substring(0, start) + 
                        prefix + text.substring(start, end) + suffix +
                        text.substring(end);
        
        textarea.focus();
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
    };
    
    window.addHeading = () => {
        const textarea = document.getElementById('blogContent');
        const start = textarea.selectionStart;
        const text = textarea.value;
        
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const prefix = '### ';
        
        textarea.value = text.substring(0, lineStart) + 
                        prefix + text.substring(lineStart);
        
        textarea.focus();
    };
    
    // Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Handle form submission
    document.getElementById('blogForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login to create a post');
            return;
        }
        
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        const category = document.getElementById('category').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const featured = document.getElementById('featured').checked;
        
        if (!title || !content || !category) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title,
            author: currentUser.name,
            authorId: currentUser.id,
            content,
            category,
            tags,
            featured,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            likes: [],
            dislikes: [],
            comments: []
        };
        
        // Add new post to array
        posts.unshift(newPost);
        
        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Display updated posts
        displayPosts();
        
        // Show success message
        showToast('Story published successfully!');
        toggleWritePanel();
        e.target.reset();
        
        // Scroll to the posts section
        document.getElementById('stories').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Filter posts
    categoryFilter.addEventListener('change', displayPosts);
    searchInput.addEventListener('input', displayPosts);
    
    // Format date to be more readable
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Update the displayPosts function
    function displayPosts() {
        postsContainer.innerHTML = '';
        
        let filteredPosts = posts;
        
        // Apply category filter
        if (categoryFilter.value !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === categoryFilter.value);
        }
        
        // Apply search filter
        if (searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No stories found matching your criteria.</p>';
            return;
        }
        
        filteredPosts.forEach(post => {
            const safePost = {
                likes: [],
                dislikes: [],
                comments: [],
                ...post
            };
            
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            
            // Convert Markdown to HTML
            const contentHtml = marked(safePost.content);
            
            // Check if current user has liked/disliked
            const hasLiked = currentUser && safePost.likes.includes(currentUser.id);
            const hasDisliked = currentUser && safePost.dislikes.includes(currentUser.id);
            
            postElement.innerHTML = `
                <div class="post-card">
                    <h3>${safePost.title} ${safePost.featured ? '<span class="featured-star">⭐</span>' : ''}</h3>
                    <div class="meta">
                        <span class="author">
                            <span class="icon">👤</span>
                            ${safePost.author}
                        </span>
                        <span>
                            <span class="icon">🗓️</span>
                            ${formatDate(safePost.date)}
                        </span>
                        <span>
                            <span class="icon">📚</span>
                            ${safePost.category}
                        </span>
                    </div>
                    <div class="content">${contentHtml}</div>
                    <div class="tags">
                        ${safePost.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="engagement">
                        <div class="reactions">
                            <button onclick="handleLike(${safePost.id})" class="like-btn ${hasLiked ? 'active' : ''}" ${!currentUser ? 'disabled' : ''}>
                                <span class="like-icon">❤️</span>
                                <span>${safePost.likes.length}</span>
                            </button>
                            <button onclick="handleDislike(${safePost.id})" class="dislike-btn ${hasDisliked ? 'active' : ''}" ${!currentUser ? 'disabled' : ''}>
                                <span class="dislike-icon">👎</span>
                                <span>${safePost.dislikes.length}</span>
                            </button>
                            <button class="comment-btn" onclick="toggleComments(${safePost.id})">
                                <span class="comment-icon">💬</span>
                                <span>${safePost.comments.length}</span>
                            </button>
                        </div>
                        ${safePost.authorId === (currentUser?.id || '') ? 
                            `<button onclick="deletePost(${safePost.id})" class="delete-btn" title="Delete post">
                                <span class="delete-icon">🗑️</span>
                            </button>` : ''}
                    </div>
                    <div class="comments-section" id="comments-${safePost.id}">
                        <h4>
                            <span class="icon">💬</span>
                            Comments (${safePost.comments.length})
                        </h4>
                        ${currentUser ? `
                            <form onsubmit="handleComment(event, ${safePost.id})" class="comment-form">
                                <textarea placeholder="Share your thoughts..." required></textarea>
                                <button type="submit">Post Comment</button>
                            </form>
                        ` : '<p class="login-prompt">Please login to comment</p>'}
                        <div class="comments-list">
                            ${safePost.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <strong>${comment.author}</strong>
                                        <span>${formatDate(comment.timestamp)}</span>
                                    </div>
                                    <p>${comment.content}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            postsContainer.appendChild(postElement);
            
            // Highlight code blocks
            postElement.querySelectorAll('pre code').forEach((block) => {
                Prism.highlightElement(block);
            });
        });
    }
    
    // Delete post function
    window.deletePost = (postId) => {
        if (!currentUser) return;
        
        const post = posts.find(p => p.id === postId);
        if (post.authorId !== currentUser.id) {
            alert('You can only delete your own posts!');
            return;
        }
        
        if (confirm('Are you sure you want to delete this post?')) {
            posts = posts.filter(post => post.id !== postId);
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            displayPosts();
        }
    };
    
    // Like/Dislike functions
    window.handleLike = (postId) => {
        if (!currentUser) return;
        
        const post = posts.find(p => p.id === postId);
        const userIndex = post.likes.indexOf(currentUser.id);
        
        if (userIndex === -1) {
            // Remove from dislikes if exists
            const dislikeIndex = post.dislikes.indexOf(currentUser.id);
            if (dislikeIndex !== -1) {
                post.dislikes.splice(dislikeIndex, 1);
            }
            // Add like
            post.likes.push(currentUser.id);
        } else {
            // Remove like
            post.likes.splice(userIndex, 1);
        }
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        displayPosts();
    };
    
    window.handleDislike = (postId) => {
        if (!currentUser) return;
        
        const post = posts.find(p => p.id === postId);
        const userIndex = post.dislikes.indexOf(currentUser.id);
        
        if (userIndex === -1) {
            // Remove from likes if exists
            const likeIndex = post.likes.indexOf(currentUser.id);
            if (likeIndex !== -1) {
                post.likes.splice(likeIndex, 1);
            }
            // Add dislike
            post.dislikes.push(currentUser.id);
        } else {
            // Remove dislike
            post.dislikes.splice(userIndex, 1);
        }
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        displayPosts();
    };
    
    // Comment function
    window.handleComment = (event, postId) => {
        event.preventDefault();
        if (!currentUser) return;
        
        const form = event.target;
        const content = form.querySelector('textarea').value;
        
        const post = posts.find(p => p.id === postId);
        post.comments.push({
            id: Date.now(),
            author: currentUser.name,
            authorId: currentUser.id,
            content,
            timestamp: Date.now()
        });
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        displayPosts();
        form.reset();
    };

    // Close panel with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('writePanel').classList.contains('active')) {
            toggleWritePanel();
        }
    });

    // Add toggle comments function
    function toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }
}); 