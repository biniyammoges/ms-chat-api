import { getNotificationMessage } from "../../../src/shared";
import { NotificationType } from "../../../src/modules/notification/entities/notification.entity";
import { NotificationEntity } from "../../../src/modules/notification/entities/notification.entity";
import { fixture } from "typeorm-fixture-builder";

export const notificationFixtures = {
     noti0: fixture(NotificationEntity, {
          id: "29bf027d-d8f5-4d6d-9b0a-a1b2dd4dbe26",
          action: 'post/096f4fa0-9540-477f-8647-55c2d2576f63',
          message: getNotificationMessage({ type: NotificationType.Like, username: "iamjohny" }),
          isRead: false,
          senderId: "85aceae5-b868-47de-8e19-44c6e70688b0", // user 1
          receiverId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user 0
          type: NotificationType.Like,
     }),
     noti1: fixture(NotificationEntity, {
          id: "5e7beb7b-fd5e-4274-8903-78c06aae1c71",
          action: 'post/096f4fa0-9540-477f-8647-55c2d2576f63',
          message: getNotificationMessage({ type: NotificationType.Comment, username: "iamjohny" }),
          isRead: false,
          senderId: "85aceae5-b868-47de-8e19-44c6e70688b0", // user 1
          receiverId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user 0
          type: NotificationType.Comment,
     }),
     noti3: fixture(NotificationEntity, {
          id: "80620c61-e405-4b4b-948c-bb058342f243",
          action: 'post/905e6f54-791f-4098-ade9-3d9c93232951',
          message: getNotificationMessage({ type: NotificationType.Reply, username: "iamjohny" }),
          isRead: false,
          senderId: "85aceae5-b868-47de-8e19-44c6e70688b0", // user 1
          receiverId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user 0
          type: NotificationType.Reply,
     }),
     noti4: fixture(NotificationEntity, {
          id: "939afce1-e39a-43f8-8b22-b293571c01f9",
          action: 'post/905e6f54-791f-4098-ade9-3d9c93232951',
          message: getNotificationMessage({ type: NotificationType.CommentLike, username: "iamjohny" }),
          isRead: false,
          senderId: "85aceae5-b868-47de-8e19-44c6e70688b0", // user 1
          receiverId: "051ee4bc-df0f-494a-961b-0591f8d6694e", // user 0
          type: NotificationType.CommentLike,
     }),
}