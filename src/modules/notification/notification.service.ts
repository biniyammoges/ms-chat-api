import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateNotificationDto } from './dtos/create-notfication.dto';
import { NotificationEntity } from './entities/notification.entity';
import { RedisEmitterService } from '../../shared/modules/redis-emitter/redis-emitter.service';
import { UserEntity } from '../user/entities/user.entity';
import { NotificationSocketEvents, PaginationDto } from '../../shared';

@Injectable()
export class NotificationService {
     constructor(@InjectEntityManager() private em: EntityManager, private redisEmitterService: RedisEmitterService) { }

     async sendNotification(data: CreateNotificationDto): Promise<NotificationEntity> {
          const [notification, user] = await Promise.all([this.em.save(this.em.create(NotificationEntity, { ...data })), this.em.findOne(UserEntity, {
               where: { id: data.senderId },
               relations: { avatar: true },
               select: ['avatar', 'id', 'firstName']
          })])

          if (user)
               notification.sender = user;

          await this.redisEmitterService.emitToOne({
               data: notification,
               event: NotificationSocketEvents.NEW_NOTIFICATION,
               userId: data.receiverId
          })

          return notification
     }

     async retrieveNotifications(receiverId: string, filter?: PaginationDto): Promise<[NotificationEntity[], number]> {
          const qry = await this.em.createQueryBuilder(NotificationEntity, 'n')
               .where('n.receiverId = :receiverId', { receiverId })
               .leftJoinAndSelect('n.sender', 'sender')
               .leftJoinAndSelect('sender.avatar', 'avatar')
               .orderBy('n.createdAt', 'DESC')

          if (filter.limit && filter.page) {
               qry.skip((filter.page - 1) * filter.limit)
          }

          if (filter.limit) {
               qry.limit(filter.limit)
          }

          return qry.getManyAndCount()
     }

     async readOne(notificationId: string, receiverId: string): Promise<{ isRead: boolean }> {
          const notfication = await this.em.findOne(NotificationEntity, { where: { id: notificationId, receiverId, isRead: false } });
          if (!notfication)
               throw new NotFoundException('Notification Not Found')

          await this.em.save(NotificationEntity, { ...notfication, isRead: true });
          return { isRead: true }
     }

     async readAll(notificationId: string, receiverId: string) {
          await this.em.update(NotificationEntity, { id: notificationId, receiverId, isRead: false }, { isRead: true });
          return { isRead: true }
     }
}
