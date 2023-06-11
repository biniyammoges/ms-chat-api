import { NotificationType } from "../modules/notification/entities/notification.entity"

export const getPostRoom = (id: string) => `post:${id}`

type ValidNotificationType = NotificationType.Comment | NotificationType.CommentLike | NotificationType.Follow | NotificationType.Like | NotificationType.Message | NotificationType.Reply

/**
 * 
 * @param data - has type and username property where type if notificatio type and username is senders username
 * @returns {string} - returns computed notification message
 */
export const getNotificationMessage = (data: { type: ValidNotificationType, username: string }) => {
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
     }
}