# Live Discussion Feature - Backup & Integration Guide

## Overview
The live discussion feature provides real-time chat functionality using localStorage for data persistence and a polling mechanism for updates.

## Features
- User authentication integration
- Real-time message updates (5-second polling)
- Typing indicators
- Online user tracking
- Message history (last 100 messages)
- Message deletion
- Mobile-responsive design

## Files
1. `live-discussion.html` - Chat interface
2. `live-discussion.css` - Styling
3. `live-discussion.js` - Core functionality

## Integration Points

### Authentication
The feature uses the existing auth system:
```javascript
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
```

### Data Storage
Three localStorage keys are used:
- `campus_talez_chat` - Message history
- `campus_talez_typing` - Typing indicators
- `campus_talez_online` - Online users

### Update Intervals
- Messages & Online Users: 5 seconds (`UPDATE_INTERVAL`)
- Typing Indicator: 2 seconds (`TYPING_TIMEOUT`)

## Backup Instructions

1. Save copies of:
   - live-discussion.html
   - live-discussion.css
   - live-discussion.js

2. Backup localStorage data:
```javascript
const backup = {
    chat: localStorage.getItem('campus_talez_chat'),
    typing: localStorage.getItem('campus_talez_typing'),
    online: localStorage.getItem('campus_talez_online')
};
localStorage.setItem('live_discussion_backup', JSON.stringify(backup));
```

3. Restore from backup:
```javascript
const backup = JSON.parse(localStorage.getItem('live_discussion_backup'));
localStorage.setItem('campus_talez_chat', backup.chat);
localStorage.setItem('campus_talez_typing', backup.typing);
localStorage.setItem('campus_talez_online', backup.online);
```

## Troubleshooting

1. Messages not updating:
   - Check `UPDATE_INTERVAL` in live-discussion.js
   - Verify localStorage permissions
   - Clear localStorage cache if needed

2. User status issues:
   - Ensure user is logged in
   - Check `currentUser` object in localStorage
   - Verify online status update interval

3. Mobile layout problems:
   - Check viewport meta tag
   - Verify CSS media queries
   - Test on different devices

## Recovery Steps

If the feature stops working:

1. Clear localStorage data:
```javascript
localStorage.removeItem('campus_talez_chat');
localStorage.removeItem('campus_talez_typing');
localStorage.removeItem('campus_talez_online');
```

2. Refresh the page
3. If issues persist, restore from backup
4. If backup fails, reinstall the original files

## Performance Notes

- Messages are limited to last 100 to prevent localStorage overflow
- Online status updates every 5 seconds to balance responsiveness and performance
- Typing indicators timeout after 2 seconds of inactivity
- Mobile optimizations reduce layout shifts and improve responsiveness 