import { Injectable } from "@nestjs/common"
import { UserTransformer } from "../user/transformer/user.transformer"
import { NotificationEntity } from "./entities/notification.entity"
import { BaseNotificationDto } from "./dtos/base-notification.dto"

@Injectable()
export class NotificationTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: NotificationEntity, opts?: Record<string, never>) {
          const result: BaseNotificationDto = {
               ...entity,
               ...(entity.sender && { sender: this.userTransformer.entityToDto(entity.sender) }),
               ...(entity.receiver && { receiver: this.userTransformer.entityToDto(entity.receiver) }),
          }

          return result
     }
}