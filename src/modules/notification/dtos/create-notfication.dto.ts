import { NotificationType } from "../entities/notification.entity";

export class CreateNotificationDto {
     type: NotificationType;
     message: string;
     action: string;
     isRead: boolean;
     senderId: string;
     receiverId: string;
}