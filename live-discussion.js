// Constants
const CHAT_KEY = 'campus_talez_chat';
const TYPING_KEY = 'campus_talez_typing';
const ONLINE_USERS_KEY = 'campus_talez_online';
const UPDATE_INTERVAL = 5000; // 5 seconds
const TYPING_TIMEOUT = 2000; // 2 seconds

// DOM Elements
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const userCountSpan = document.getElementById('userCount');
const userListContainer = document.getElementById('userList');
const typingIndicator = document.getElementById('typingIndicator');

// Get current user from auth system
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
const username = currentUser.name 
    ? `${currentUser.name.split(' ')[0]} ${currentUser.name.split(' ')[1]?.charAt(0)}.`
    : 'Guest_' + Math.floor(Math.random() * 1000);

const userId = currentUser.id || 'guest_' + Math.random().toString(36).substr(2, 9);

// Online users management
function updateOnlineUsers() {
    const now = Date.now();
    const onlineUsers = JSON.parse(localStorage.getItem(ONLINE_USERS_KEY) || '{}');
    
    // Update current user's timestamp
    onlineUsers[userId] = {
        name: username,
        lastSeen: now,
        avatar: currentUser.avatar || null
    };
    
    // Remove users not seen in last 10 seconds
    Object.keys(onlineUsers).forEach(id => {
        if (now - onlineUsers[id].lastSeen > 10000) {
            delete onlineUsers[id];
        }
    });
    
    localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
    return onlineUsers;
}

function displayOnlineUsers() {
    const onlineUsers = updateOnlineUsers();
    const userCount = Object.keys(onlineUsers).length;
    userCountSpan.textContent = `${userCount} Online`;
    
    if (userListContainer) {
        userListContainer.innerHTML = '';
        Object.entries(onlineUsers).forEach(([id, user]) => {
            const userElement = document.createElement('li');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-avatar">
                    ${user.avatar 
                        ? `<img src="${user.avatar}" alt="${user.name}">`
                        : `<div class="avatar-placeholder">${user.name[0]}</div>`}
                </div>
                <span class="user-name">${user.name}</span>
                <span class="online-indicator"></span>
            `;
            userListContainer.appendChild(userElement);
        });
    }
}

// Message handling functions
function saveMessage(content) {
    const messages = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    const newMessage = {
        id: Date.now(),
        content,
        author: username,
        authorId: userId,
        timestamp: new Date().toISOString(),
        avatar: currentUser.avatar || null
    };
    
    messages.push(newMessage);
    // Keep only last 100 messages
    if (messages.length > 100) {
        messages.shift();
    }
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    return newMessage;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(/\s/, '').toLowerCase(); // Convert "4:23 PM" format
}

function createMessageElement(message) {
    const isOwnMessage = message.authorId === userId;
    const div = document.createElement('div');
    div.className = `message ${isOwnMessage ? 'sent' : 'received'}`;
    div.dataset.messageId = message.id;
    
    div.innerHTML = `
        <div class="message-header">
            <div class="author-info">
                ${message.avatar 
                    ? `<img src="${message.avatar}" alt="${message.author}" class="message-avatar">` 
                    : `<div class="avatar-placeholder">${message.author[0]}</div>`}
                <span class="author-name">${message.author}</span>
            </div>
            <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
            ${isOwnMessage ? `
                <button class="delete-message" onclick="deleteMessage(${message.id})">
                    <span class="delete-icon">🗑️</span>
                </button>
            ` : ''}
        </div>
        <div class="content">${message.content}</div>
    `;
    return div;
}

function displayMessages() {
    const messages = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    messageContainer.innerHTML = '';
    
    messages.forEach(message => {
        messageContainer.appendChild(createMessageElement(message));
    });
    
    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Typing indicator
let typingTimeout;
function updateTypingStatus() {
    const typingUsers = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
    const now = Date.now();
    
    // Update current user's typing status
    if (messageInput.value.trim()) {
        typingUsers[userId] = {
            name: username,
            timestamp: now
        };
    } else {
        delete typingUsers[userId];
    }
    
    // Remove stale typing indicators
    Object.keys(typingUsers).forEach(id => {
        if (now - typingUsers[id].timestamp > TYPING_TIMEOUT) {
            delete typingUsers[id];
        }
    });
    
    localStorage.setItem(TYPING_KEY, JSON.stringify(typingUsers));
    
    // Display typing indicator
    const typingUsersList = Object.values(typingUsers)
        .filter(user => user.name !== username)
        .map(user => user.name);
    
    if (typingIndicator) {
        if (typingUsersList.length > 0) {
            typingIndicator.textContent = `${typingUsersList.join(', ')} ${typingUsersList.length === 1 ? 'is' : 'are'} typing...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    }
}

// Event handlers
function handleSendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    saveMessage(content);
    messageInput.value = '';
    displayMessages();
    updateTypingStatus();
}

function deleteMessage(messageId) {
    const messages = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex !== -1 && messages[messageIndex].authorId === userId) {
        messages.splice(messageIndex, 1);
        localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
        displayMessages();
    }
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    updateTypingStatus();
    typingTimeout = setTimeout(() => {
        updateTypingStatus();
    }, TYPING_TIMEOUT);
});

// Toggle sidebar on mobile
const toggleSidebar = document.getElementById('toggleSidebar');
if (toggleSidebar) {
    toggleSidebar.addEventListener('click', () => {
        document.querySelector('.chat-sidebar').classList.toggle('active');
    });
}

// Initial load
displayMessages();
displayOnlineUsers();

// Set up periodic updates
setInterval(() => {
    displayMessages();
    displayOnlineUsers();
    updateTypingStatus();
}, UPDATE_INTERVAL); 