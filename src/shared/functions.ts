import { NotificationType } from "../modules/notification/entities/notification.entity"

export const getPostRoom = (id: string) => `post:${id}`
export const getChatRoomId = (id: string) => `chat-room:${id}`

// currently supported notification types
type SupportedNotificationType = NotificationType.Comment | NotificationType.CommentLike | NotificationType.Follow | NotificationType.Like | NotificationType.Message | NotificationType.Reply | NotificationType.AddedStory

/**
 * 
 * @param data - has type and username property where type if notificatio type and username is senders username
 * @returns {string} - returns computed notification message
 */
export const getNotificationMessage = (data: { type: SupportedNotificationType, username: string }) => {
     switch (data.type) {
          case NotificationType.Like:
               return `@${data.username} has liked your photo`
          case NotificationType.Comment:
               return `@${data.username} has commented on your photo`
          case NotificationType.CommentLike:
               return `@${data.username} has liked your comment`
          case NotificationType.Reply:
               return `@${data.username} has replied to your comment`
          case NotificationType.Follow:
               return `@${data.username} started following you`
          case NotificationType.AddedStory:
               return `@${data.username} recently added to their story, don't miss out!`
     }
}