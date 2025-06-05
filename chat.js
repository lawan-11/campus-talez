// Chat State Management
let currentChannel = 'general';
const STORAGE_KEY = 'campusTalez_messages';

// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageContainer = document.getElementById('messageContainer');
const channelList = document.getElementById('channelList');
const currentChannelElement = document.getElementById('currentChannel');
const userCountElement = document.getElementById('userCount');
const userList = document.getElementById('userList');

// Initialize messages from localStorage
let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
Object.keys(messages).forEach(channel => {
    if (!Array.isArray(messages[channel])) {
        messages[channel] = [];
    }
});

// Check login status
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        openLoginModal();
        messageInput.disabled = true;
        sendButton.disabled = true;
    } else {
        messageInput.disabled = false;
        sendButton.disabled = false;
        updateUserList();
    }
}

// Message Functions
function addMessage(channel, message) {
    if (!messages[channel]) {
        messages[channel] = [];
    }
    messages[channel].push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (channel === currentChannel) {
        displayMessage(message);
    }
}

function displayMessage(message) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.userId === currentUser?.id ? 'sent' : 'received'}`;
    
    messageElement.innerHTML = `
        <div class="username">${message.username}</div>
        <div class="content">${escapeHtml(message.content)}</div>
        <div class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>
    `;
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function displayMessages(channel) {
    messageContainer.innerHTML = '';
    if (messages[channel]) {
        messages[channel].forEach(displayMessage);
    }
}

// Channel Functions
function switchChannel(channel) {
    currentChannel = channel;
    currentChannelElement.textContent = document.querySelector(`[data-channel="${channel}"]`).textContent;
    
    // Update active state
    document.querySelectorAll('#channelList li').forEach(li => {
        li.classList.toggle('active', li.dataset.channel === channel);
    });
    
    displayMessages(channel);
}

// User Management
function updateUserList() {
    const users = new Set();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Add current user
    if (currentUser) {
        users.add(currentUser.name);
    }
    
    // Add users from messages
    Object.values(messages).forEach(channelMessages => {
        channelMessages.forEach(msg => users.add(msg.username));
    });
    
    userList.innerHTML = Array.from(users).map(username => `
        <li>${username}</li>
    `).join('');
    
    userCountElement.textContent = `${users.size} users`;
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Event Listeners
sendButton.addEventListener('click', () => {
    const content = messageInput.value.trim();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (content && currentUser) {
        const message = {
            userId: currentUser.id,
            username: currentUser.name,
            content,
            timestamp: Date.now()
        };
        addMessage(currentChannel, message);
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

channelList.addEventListener('click', (e) => {
    const channel = e.target.closest('li')?.dataset.channel;
    if (channel) {
        switchChannel(channel);
    }
});

// Auto-resize textarea
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    displayMessages(currentChannel);
}); 