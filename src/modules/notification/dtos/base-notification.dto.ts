import { BaseDto } from "../../../shared";
import { NotificationType } from "../entities/notification.entity";
import { UserDto as BaseUserDto } from "../../user/dtos/user.dto";

export class BaseNotificationDto extends BaseDto {
     type: NotificationType;
     message: string;
     action: string;
     isRead: boolean;
     senderId: string;
     sender: BaseUserDto;
     receiverId: string;
     receiver: BaseUserDto;
}
