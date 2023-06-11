import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RedisEmitterService } from 'src/shared/modules/redis-emitter/redis-emitter.service';
import { EntityManager } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { ChatSocketEvents, PaginationDto } from 'src/shared';
import { ChatRoomEntity, ChatRoomType } from './entities/chat-room.entity';
import { ChatEntity } from './entities/chat.entity';
import { ChatUserEntity } from './entities/chat-user.entity';
import { CreateChatDto } from './dtos/create-chat.dto';

@Injectable()
export class ChatService {
     constructor(
          @InjectEntityManager()
          private em: EntityManager,
          private redisEmiiterService: RedisEmitterService,
          private notificationService: NotificationService) { }

     async retrieveChatRooms(userId: string, filter?: PaginationDto): Promise<[ChatRoomEntity[], number]> {
          const qry = await this.em.createQueryBuilder(ChatRoomEntity, 'cr')
               .leftJoin('cr.chats', 'chats')
               .leftJoinAndSelect('cr.chatUsers', 'chatUsers')
               .where('chatUsers.userId = :userId', { userId })
               .leftJoinAndSelect('chatUsers.user', 'user')
               .orderBy('chats.createdAt', 'DESC');

          if (filter.limit && filter.page) {
               qry.skip((filter.page - 1) * filter.limit)
          }
          if (filter.limit) {
               qry.limit(filter.limit)
          }

          return qry.getManyAndCount()
     }

     async getChatUsers(chatRoomId: string, opts?: { userIdToExclude?: string, fetchFromPrivate?: boolean }) {
          const chatRoom = await this.em.findOne(ChatRoomEntity, { where: { id: chatRoomId } });
          if (!chatRoom) {
               throw new BadRequestException('ChatRoom Not Found')
          }

          const chatUserQry = await this.em.createQueryBuilder(ChatUserEntity, 'cu')
               .where('cu.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoin('cu.chatRoom', 'chatRoom')

          if (!!opts?.fetchFromPrivate) {
               chatUserQry.andWhere('chatRoom.type = :type', { type: ChatRoomType.Private });
          }

          if (opts?.userIdToExclude) {
               chatUserQry.andWhere('cu.userId != :userIdToExclude', { userIdToExclude: opts.userIdToExclude });
          }

          return chatUserQry.getMany()
     }

     async retrieveChats(chatRoomId: string, retrieverId: string, filter?: PaginationDto): Promise<[ChatEntity[], number]> {
          const chatQry = await this.em.createQueryBuilder(ChatEntity, 'c')
               .where('c.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoinAndSelect('c.sender', 'sender')
               .orderBy('c.createdAt', 'ASC');

          if (filter.limit && filter.page) {
               chatQry.skip((filter.page - 1) * filter.limit)
          }

          if (filter.limit) {
               chatQry.limit(filter.limit)
          }

          const [chatUsers, chatResponse] = await Promise.all([
               this.getChatUsers(chatRoomId, { userIdToExclude: retrieverId, fetchFromPrivate: true }),
               chatQry.getManyAndCount()])

          // emits seen event to other user only if chat room is private
          if (chatUsers.length) {
               await this.redisEmiiterService.emitToOne({
                    event: ChatSocketEvents.Seen,
                    data: { chatRoomId },
                    userId: chatUsers[0].userId //other user id in private chat room
               })
          }

          return chatResponse
     }

     async sendMessage(data: CreateChatDto, senderId: string) {
          const [chatUsers, message] = await Promise.all([
               this.getChatUsers(data.chatRoomId, { userIdToExclude: senderId }),
               this.em.save(this.em.create(ChatEntity, { ...data, senderId }))])

          if (chatUsers.length) {
               for (const cu of chatUsers) {
                    this.redisEmiiterService.emitToOne({ data: message, event: ChatSocketEvents.NewMessage, userId: cu.userId })
               }
          }
     }
}
