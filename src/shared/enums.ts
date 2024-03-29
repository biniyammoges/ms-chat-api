export enum SocketEvents {
     Connection = 'connection',
     Disconnect = 'disconnect',
     Error = 'error'
}

export enum SocketPostEvents {
     NEW_POST = 'new-post',
     NEW_COMMENT = 'new-comment',
     NEW_LIKE = 'new-like',
     JOIN_POST_ROOM = 'join-post-room',
     JOINED_POST_ROOM = 'joined-post-room',
     LEAVE_POST_ROOM = 'leave-post-room',
     LEFT_POST_ROOM = 'left-post-room'
}

export enum NotificationSocketEvents {
     NEW_NOTIFICATION = 'new-notification',
}

export enum OnlineStatusEvents {
     ONLINE = 'online',
     OFFLINE = 'offline'
}

export enum ChatSocketEvents {
     SendMessage = 'send-message',
     MessageSent = 'message-sent',
     NewMessage = 'new-message',
     Seen = 'seen',
     SentSeen = 'sent-seen',
     Typing = 'typing',
     TypingSent = 'typing-sent',
     StoppedTyping = 'stopped-typing',
     StoppedTypingSent = 'stopped-typing-sent',
     Active = 'active',
     Offline = 'offline',
     JoinChatRoom = 'join-chat-room',
     JoinedChatRoom = 'joined-chat-room',
     leaveChatRoom = 'leave-chat-room',
     leftChatRoom = 'left-chat-room',
}