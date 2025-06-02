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

    // Load existing posts from localStorage
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
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
    
    // Form submission
    blogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('blogTitle').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('blogContent').value;
        const category = document.getElementById('category').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const featured = document.getElementById('featured').checked;
        
        const newPost = {
            id: Date.now(),
            title,
            author,
            content,
            category,
            tags,
            featured,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        
        // Add new post to array
        posts.unshift(newPost);
        
        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Display updated posts
        displayPosts();
        
        // Clear form
        blogForm.reset();
    });
    
    // Filter posts
    categoryFilter.addEventListener('change', displayPosts);
    searchInput.addEventListener('input', displayPosts);
    
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
        
        filteredPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            
            // Convert Markdown to HTML
            const contentHtml = marked(post.content);
            
            postElement.innerHTML = `
                <h3>${post.title} ${post.featured ? '⭐' : ''}</h3>
                <div class="meta">
                    <span>By ${post.author}</span> | 
                    <span>${post.date} at ${post.time}</span> |
                    <span>Category: ${post.category}</span>
                </div>
                <div class="content">${contentHtml}</div>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button onclick="deletePost(${post.id})" class="delete-btn">Delete</button>
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
        if (confirm('Are you sure you want to delete this post?')) {
            posts = posts.filter(post => post.id !== postId);
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            displayPosts();
        }
    };
}); 