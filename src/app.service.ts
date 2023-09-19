import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UserEntity } from "./modules/user/entities/user.entity";
import { ChatRoomEntity } from "./modules/chat/entities/chat-room.entity";
import { NotificationEntity } from './modules/notification/entities/notification.entity'

export type GlobalAppData = {
     unreadMessageCount: number
     unreadNotificationCount: number
}

@Injectable()
export class AppService {
     constructor(@InjectEntityManager() private em: EntityManager) { }

     async getGlobalAppData(user: UserEntity): Promise<GlobalAppData> {
          const [[rooms], unreadNotificationCount] = await Promise.all([
               this.em.createQueryBuilder(ChatRoomEntity, 'cr')
                    .innerJoin('cr.chatUsers', 'chatUsers', 'chatUsers.userId = :userId', { userId: user.id })
                    .leftJoin('cr.chats', 'chats')
                    .loadRelationCountAndMap('cr.unreadCount', 'cr.chats', 'c', qb => qb
                         .where('c.isSeen = :isSeen', { isSeen: false })
                         .andWhere('c.senderId != :senderId', { senderId: user.id }))
                    .getManyAndCount(),

               this.em.createQueryBuilder(NotificationEntity, 'noti')
                    .where('noti.receiverId = :receiverId', { receiverId: user.id })
                    .andWhere('noti.isRead = :isRead', { isRead: false }).getCount()
          ])

          const unreadMessageCount = rooms.reduce((all, cur) => {
               return all + cur.unreadCount
          }, 0)

          return { unreadMessageCount, unreadNotificationCount }
     }
}