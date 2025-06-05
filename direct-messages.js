// Constants
const DM_STORAGE_KEY = 'campus_talez_dms';
const DM_TYPING_KEY = 'campus_talez_dm_typing';
const UPDATE_INTERVAL = 5000; // 5 seconds
const TYPING_TIMEOUT = 2000; // 2 seconds

// DOM Elements
const dmTrigger = document.getElementById('dmTrigger');
const dmBadge = document.getElementById('dmBadge');
const dmPanel = document.getElementById('dmPanel');
const dmMinimize = document.getElementById('dmMinimize');
const dmClose = document.getElementById('dmClose');
const dmSearch = document.getElementById('dmSearch');
const dmUsers = document.getElementById('dmUsers');
const dmChat = document.getElementById('dmChat');
const dmBack = document.getElementById('dmBack');
const dmMessages = document.getElementById('dmMessages');
const dmInput = document.getElementById('dmInput');
const dmSend = document.getElementById('dmSend');
const dmTypingIndicator = document.querySelector('.dm-typing-indicator');

// State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
let currentRecipient = null;
let unreadMessages = {};
let typingTimeout;

// Initialize DMs from localStorage
let directMessages = JSON.parse(localStorage.getItem(DM_STORAGE_KEY) || '{}');

// Helper Functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function getUnreadCount(userId) {
    return unreadMessages[userId] || 0;
}

function updateUnreadBadge() {
    const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);
    dmBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
    dmBadge.classList.toggle('visible', totalUnread > 0);
}

function getUsersList() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.id !== currentUser.id);
}

function getLastMessage(userId) {
    const conversation = directMessages[`${currentUser.id}_${userId}`] || 
                        directMessages[`${userId}_${currentUser.id}`] || [];
    return conversation[conversation.length - 1];
}

// UI Functions
function togglePanel() {
    dmPanel.classList.toggle('active');
    if (dmPanel.classList.contains('active')) {
        displayUsers();
    }
}

function minimizePanel() {
    dmPanel.classList.toggle('minimized');
}

function closePanel() {
    dmPanel.classList.remove('active', 'minimized');
    showUsersList();
}

function showUsersList() {
    dmChat.classList.remove('active');
    dmUsers.style.display = 'block';
}

function showChat(user) {
    currentRecipient = user;
    dmUsers.style.display = 'none';
    dmChat.classList.add('active');
    
    // Update chat header
    const recipientName = document.querySelector('.dm-recipient-name');
    const recipientAvatar = document.querySelector('.dm-recipient-avatar');
    recipientName.textContent = user.name;
    recipientAvatar.textContent = user.name[0];
    
    // Reset unread count
    unreadMessages[user.id] = 0;
    updateUnreadBadge();
    
    // Display messages
    displayMessages();
}

function displayUsers() {
    const users = getUsersList();
    const searchTerm = dmSearch.value.toLowerCase();
    
    dmUsers.innerHTML = users
        .filter(user => user.name.toLowerCase().includes(searchTerm))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(user => {
            const lastMessage = getLastMessage(user.id);
            const unreadCount = getUnreadCount(user.id);
            
            return `
                <div class="dm-user-item" onclick="showChat(${JSON.stringify(user)})">
                    <div class="dm-user-avatar">${user.name[0]}</div>
                    <div class="dm-user-info">
                        <div class="dm-user-name">${user.name}</div>
                        ${lastMessage ? `
                            <div class="dm-last-message">
                                ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}
                            </div>
                        ` : ''}
                    </div>
                    ${unreadCount ? `
                        <span class="dm-unread-count">${unreadCount}</span>
                    ` : ''}
                </div>
            `;
        })
        .join('');
}

function displayMessages() {
    const conversationKey = [currentUser.id, currentRecipient.id].sort().join('_');
    const messages = directMessages[conversationKey] || [];
    
    dmMessages.innerHTML = messages.map(message => `
        <div class="dm-message ${message.senderId === currentUser.id ? 'sent' : 'received'}">
            <div class="dm-message-content">${message.content}</div>
            <div class="dm-message-time">${formatTimestamp(message.timestamp)}</div>
        </div>
    `).join('');
    
    dmMessages.scrollTop = dmMessages.scrollHeight;
}

// Message Functions
function sendMessage() {
    const content = dmInput.value.trim();
    if (!content || !currentRecipient) return;
    
    const conversationKey = [currentUser.id, currentRecipient.id].sort().join('_');
    const message = {
        id: Date.now(),
        senderId: currentUser.id,
        recipientId: currentRecipient.id,
        content,
        timestamp: new Date().toISOString()
    };
    
    directMessages[conversationKey] = directMessages[conversationKey] || [];
    directMessages[conversationKey].push(message);
    
    localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(directMessages));
    dmInput.value = '';
    displayMessages();
    updateTypingStatus(false);
}

// Typing Indicator
function updateTypingStatus(isTyping) {
    const typingUsers = JSON.parse(localStorage.getItem(DM_TYPING_KEY) || '{}');
    
    if (isTyping && currentRecipient) {
        typingUsers[`${currentUser.id}_${currentRecipient.id}`] = {
            userId: currentUser.id,
            timestamp: Date.now()
        };
    } else {
        delete typingUsers[`${currentUser.id}_${currentRecipient.id}`];
    }
    
    localStorage.setItem(DM_TYPING_KEY, JSON.stringify(typingUsers));
}

function checkTypingIndicators() {
    if (!currentRecipient) return;
    
    const typingUsers = JSON.parse(localStorage.getItem(DM_TYPING_KEY) || '{}');
    const key = `${currentRecipient.id}_${currentUser.id}`;
    const typing = typingUsers[key];
    
    if (typing && Date.now() - typing.timestamp < TYPING_TIMEOUT) {
        dmTypingIndicator.textContent = 'typing...';
        dmTypingIndicator.style.display = 'block';
    } else {
        dmTypingIndicator.style.display = 'none';
    }
}

// Event Listeners
dmTrigger.addEventListener('click', togglePanel);
dmMinimize.addEventListener('click', minimizePanel);
dmClose.addEventListener('click', closePanel);
dmBack.addEventListener('click', showUsersList);
dmSearch.addEventListener('input', displayUsers);

dmInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    updateTypingStatus(true);
    typingTimeout = setTimeout(() => updateTypingStatus(false), TYPING_TIMEOUT);
});

dmInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

dmSend.addEventListener('click', sendMessage);

// Initialize
function initialize() {
    if (!currentUser.id) {
        dmTrigger.style.display = 'none';
        return;
    }
    
    displayUsers();
    
    // Check for new messages and typing indicators
    setInterval(() => {
        const newMessages = JSON.parse(localStorage.getItem(DM_STORAGE_KEY) || '{}');
        if (JSON.stringify(newMessages) !== JSON.stringify(directMessages)) {
            directMessages = newMessages;
            if (currentRecipient) {
                displayMessages();
            }
            displayUsers();
        }
        checkTypingIndicators();
    }, UPDATE_INTERVAL);
}

// Start the DM system
initialize(); 