export enum SocketEvents {
     CONNECTION = 'connection',
     DISCONNECT = 'disconnect',
     ERROR = 'error'
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

export enum ChatSocketEvents {
     NewMessage = 'new-message',
     Seen = 'seen',
     Typing = 'typing',
     Active = 'active',
     Offline = 'offline',
     JoinChatRoom = 'join-chat-room',
     JoinedChatRoom = 'joined-chat-room',
     leaveChatRoom = 'leave-chat-room',
     leftChatRoom = 'left-chat-room',
}