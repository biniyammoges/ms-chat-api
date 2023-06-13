import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RedisEmitterService } from '../../shared/modules/redis-emitter/redis-emitter.service';
import { EntityManager, Not } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { ChatSocketEvents, PaginationDto } from '../../shared';
import { ChatRoomEntity, ChatRoomType } from './entities/chat-room.entity';
import { ChatEntity } from './entities/chat.entity';
import { ChatUserEntity } from './entities/chat-user.entity';
import { CreateChatDto } from './dtos/create-chat.dto';
import { WsException } from '@nestjs/websockets';
import { JoinChatRoomDto } from './dtos/join-or-leave-chat-room.dto';

@Injectable()
export class ChatService {
     constructor(
          @InjectEntityManager()
          private em: EntityManager,
          private redisEmitterService: RedisEmitterService,
          private notificationService: NotificationService) { }


     async findOrCreateChatRoom(data: JoinChatRoomDto, finderOrCreatorId: string) {
          const roomQry = await this.em.createQueryBuilder(ChatRoomEntity, 'cr');

          if (data.chatRoomId) {
               roomQry.where('cr.id = :id', { id: data.chatRoomId })
          }

          const chatRoom = await roomQry
               .innerJoin('cr.chatUsers', 'chatUsers')
               .andWhere('chatUsers.userId = :recipientId', { recipientId: data.recipientId })
               .andWhere('chatUsers.userId = :finderOrCreatorId', { finderOrCreatorId })
               .getOne();

          if (chatRoom)
               return chatRoom
          else {
               return this.em.save(this.em.create(ChatRoomEntity, {
                    type: ChatRoomType.Private,
                    chatUsers: [
                         { userId: data.recipientId },
                         { userId: finderOrCreatorId }
                    ]
               }))
          }
     }

     async retrieveChatRooms(userId: string, filter?: PaginationDto): Promise<[ChatRoomEntity[], number]> {
          const qry = await this.em.createQueryBuilder(ChatRoomEntity, 'cr')
               .leftJoin('cr.chats', 'chats')
               .loadRelationCountAndMap('cr.unreadCount', 'cr.chats', 'c', qb => qb
                    .where('c.isSeen = :isSeen', { isSeen: false })
                    .andWhere('c.senderId != :senderId', { senderId: userId }))
               .leftJoinAndSelect('cr.chatUsers', 'chatUsers')
               .leftJoinAndSelect('chatUsers.user', 'user')
               .leftJoinAndSelect('user.avatar', 'avatar')
               .where('chatUsers.userId = :userId', { userId })
               .orderBy('chats.createdAt', 'DESC');

          if (filter.limit && filter.page) {
               qry.skip((filter.page - 1) * filter.limit)
          }
          if (filter.limit) {
               qry.limit(filter.limit)
          }

          const [rooms, total] = await qry.getManyAndCount()
          for (const room of rooms) {
               const chat = await this.em.findOne(ChatEntity, {
                    where: { chatRoomId: room.id },
                    relations: ['sender'],
                    order: { createdAt: 'desc' }
               })

               room.chats = chat ? [chat] : []
          }

          return [rooms, total]
     }

     /**
      * 
      * @param chatRoomId - chat room id 
      * @param opts - filter option - has userIdToExclude and fetchFromPrivate room 
      * @returns  {ChatUserEntity[]} - array of chat user entity
      */
     async getChatUsers(chatRoomId: string, opts?: { userIdToExclude?: string, fetchFromPrivateRoom?: boolean }) {
          const chatRoom = await this.em.findOne(ChatRoomEntity, {
               where: {
                    id: chatRoomId,
                    chatUsers: {
                         userId: opts.userIdToExclude // checks if the userId exists in chat room
                    }
               }
          });
          if (!chatRoom) {
               throw new WsException('ChatRoom Not Found')
          }

          const chatUserQry = await this.em.createQueryBuilder(ChatUserEntity, 'cu')
               .where('cu.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoin('cu.chatRoom', 'chatRoom')

          if (!!opts?.fetchFromPrivateRoom) {
               chatUserQry.andWhere('chatRoom.type = :type', { type: ChatRoomType.Private });
          }

          if (opts?.userIdToExclude) {
               chatUserQry.andWhere('cu.userId != :userIdToExclude', { userIdToExclude: opts.userIdToExclude });
          }

          return chatUserQry.getMany()
     }

     /**
      * 
      * @param chatRoomId - used to filter chat rooms by id
      * @param retrieverId  - used to filter chat rooms where the retriever is in
      * @param filter - has limit and page property for pagination
      * @returns 
      */
     async retrieveChats(chatRoomId: string, retrieverId: string, filter?: PaginationDto): Promise<[ChatEntity[], number]> {
          const chatUsers = await this.getChatUsers(chatRoomId, { userIdToExclude: retrieverId, fetchFromPrivateRoom: true });

          const chatQry = await this.em.createQueryBuilder(ChatEntity, 'c')
               .where('c.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoinAndSelect('c.sender', 'sender')
               .orderBy('c.createdAt', 'DESC');

          if (filter.limit && filter.page) {
               chatQry.skip((filter.page - 1) * filter.limit)
          }

          if (filter.limit) {
               chatQry.limit(filter.limit)
          }

          return chatQry.getManyAndCount()
     }

     /**
      * 
      * @param param0 - has two properties chatRoomId and userId, userId is to filter message not sent by userId
      * @returns 
      */
     async maskAllMessagesAsSeen({ chatRoomId, userId }: { userId: string, chatRoomId: string }) {
          const response = await this.em.update(ChatEntity, { userId, chatRoomId, isSeen: false }, { isSeen: true })
          return { seenCount: response.affected, chatRoomId }
     }

     /**
      * 
      * @param data - contains message data
      * @param senderId - to identify who sent the message
      * @param socketId - optional and to exclude the socket from recieving event 
      */
     async sendMessage(data: CreateChatDto, senderId: string, socketId?: string) {
          const chatUsers = await this.getChatUsers(data.chatRoomId, { userIdToExclude: senderId });
          const message = await this.em.save(this.em.create(ChatEntity, { ...data, senderId }));

          if (chatUsers.length) {
               for (const cu of chatUsers) {
                    this.redisEmitterService.emitToOne({
                         data: message,
                         event: ChatSocketEvents.NewMessage,
                         userId: cu.userId,
                         ...(socketId && { socketId })
                    })
               }
          }
     }
}
