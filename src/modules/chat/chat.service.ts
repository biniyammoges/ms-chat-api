import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { PaginationDto } from '../../shared';
import { ChatRoomEntity, ChatRoomType } from './entities/chat-room.entity';
import { ChatEntity } from './entities/chat.entity';
import { ChatUserEntity } from './entities/chat-user.entity';
import { CreateChatDto } from './dtos/create-chat.dto';
import { WsException } from '@nestjs/websockets';
import { JoinChatRoomDto } from './dtos/join-or-leave-chat-room.dto';
import { UserService } from '../user/user.service'
import { CreateStoryMessageDto } from '../story/dtos/create-story-message.dto';
import { ChatTransformer } from './chat.transformer';
import { BaseChatDto, BaseChatRoomDto } from './dtos/base-chat-room.dto';
import merge from 'ts-deepmerge';
import { UserTransformer } from '../user/transformer/user.transformer';

@Injectable()
export class ChatService {
     constructor(
          @InjectEntityManager()
          private em: EntityManager,
          private userService: UserService,
          private userTransformer: UserTransformer,
          private chatTransformer: ChatTransformer
     ) { }

     async findOrCreateChatRoom(data: JoinChatRoomDto, finderOrCreatorId: string): Promise<BaseChatRoomDto> {
          if (data.recipientId === finderOrCreatorId) {
               throw new WsException("You can't join room with your own Id")
          }

          // throws error if user not found with recipientId
          await this.userService.findUserById(data.recipientId, { avatar: true })
          const roomQry = await this.em.createQueryBuilder(ChatRoomEntity, 'cr');

          if (data.chatRoomId) {
               roomQry.where('cr.id = :id', { id: data.chatRoomId })
          }

          const chatRoom = await roomQry
               .innerJoinAndSelect('cr.chatUsers', 'chatUsers1', 'chatUsers1.userId = :recipientId', { recipientId: data.recipientId })
               .leftJoinAndSelect('chatUsers1.user', 'user')
               .leftJoinAndSelect('user.avatar', 'user.avatar')
               .innerJoin('cr.chatUsers', 'chatUsers2', 'chatUsers2.userId = :finderOrCreatorId', { finderOrCreatorId: finderOrCreatorId })
               .loadRelationCountAndMap('cr.unreadCount', 'cr.chats', 'c', qb => qb
                    .where('c.isSeen = :isSeen', { isSeen: false })
                    .andWhere('c.senderId != :senderId', { senderId: finderOrCreatorId }))
               .getOne();

          if (chatRoom)
               return chatRoom
          else {
               const savedChatRoom = await this.em.save(this.em.create(ChatRoomEntity, {
                    chatUsers: [
                         { userId: data.recipientId },
                         { userId: finderOrCreatorId }
                    ]
               },))

               // returns the recipient user
               const newChatRoom = await this.em.findOne(ChatRoomEntity, { where: { id: savedChatRoom.id }, relations: { chatUsers: { user: { avatar: true } } } })
               return { ...newChatRoom, chatUsers: newChatRoom.chatUsers.filter(cu => cu.userId !== finderOrCreatorId), chats: [] }
          }
     }

     async retrieveChatRooms(userId: string, filter?: PaginationDto): Promise<[BaseChatRoomDto[], number]> {
          const qry = await this.em.createQueryBuilder(ChatRoomEntity, 'cr')
               .leftJoin('cr.chats', 'chats')
               .loadRelationCountAndMap('cr.unreadCount', 'cr.chats', 'c', qb => qb
                    .where('c.isSeen = :isSeen', { isSeen: false })
                    .andWhere('c.senderId != :senderId', { senderId: userId }))
               .leftJoinAndSelect('cr.chatUsers', 'chatUsers')
               .leftJoinAndSelect('chatUsers.user', 'user')
               .leftJoinAndSelect('user.avatar', 'avatar')
               .innerJoin('cr.chatUsers', 'cu', 'cu.userId = :userId', { userId })
               .where('user.id != :id', { id: userId })
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

          return [rooms.map(r => this.chatTransformer.entityToDto(r)), total]
     }

     /**
      * 
      * @param chatRoomId - chat room id 
      * @param opts - filter option - has fetcherId to filter chatroom where fetcher is in and isFromSocket to return exception and validateChatRoom  
      * @returns  {ChatUserEntity[]} - array of chat user entity
      */
     async getChatUsers(chatRoomId: string, opts: { fetcherId?: string, isFromSocket?: boolean, validateChatRoom?: boolean } = { validateChatRoom: true }) {
          if (opts.validateChatRoom) {
               const chatRoom = await this.em.findOne(ChatRoomEntity, {
                    where: {
                         id: chatRoomId,
                         chatUsers: {
                              userId: opts.fetcherId // checks if the userId exists in chat room
                         }
                    }
               });

               if (!chatRoom) {
                    if (opts.isFromSocket)
                         throw new WsException('ChatRoom Not Found')
                    else
                         throw new NotFoundException('ChatRoom Not Found')
               }
          }

          const chatUserQry = await this.em.createQueryBuilder(ChatUserEntity, 'cu')
               .where('cu.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoin('cu.chatRoom', 'chatRoom')

          // returns
          if (opts?.fetcherId) {
               chatUserQry.andWhere('cu.userId != :fetcherId', { fetcherId: opts.fetcherId });
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
          await this.getChatUsers(chatRoomId, { fetcherId: retrieverId, isFromSocket: false });

          const chatQry = await this.em.createQueryBuilder(ChatEntity, 'c')
               .where('c.chatRoomId = :chatRoomId', { chatRoomId })
               .leftJoinAndSelect('c.sender', 'sender')
               .leftJoinAndSelect('c.parentChat', 'parentChat')
               .leftJoinAndSelect('parentChat.sender', 'parentSender')
               .leftJoinAndSelect('c.storyMessage', 'storyMessage')
               .leftJoinAndSelect('storyMessage.story', 'story')
               .orderBy('c.createdAt', 'ASC');

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
     async maskAllMessagesAsSeen({ chatRoomId, readerId }: { chatRoomId: string, readerId: string }) {
          const chatUsers = await this.getChatUsers(chatRoomId, { fetcherId: readerId, isFromSocket: true })
          const response = await this.em.update(ChatEntity, { senderId: Not(readerId), chatRoomId, isSeen: false, }, { isSeen: true })
          return { seenCount: response.affected, chatRoomId, chatUsers: chatUsers.length ? chatUsers : [] }
     }

     /**
      * 
      * @param data - contains message data
      * @param senderId - to identify who sent the message
      * @param socketId - optional and to exclude the socket from recieving event 
      */
     async sendMessage(data: CreateChatDto, senderId: string, socketId?: string) {
          const chatRoom = await this.findOrCreateChatRoom({ recipientId: data.reciepenId }, senderId)

          const chatUsers = await this.getChatUsers(chatRoom.id, {
               fetcherId: senderId,
               isFromSocket: true,
               validateChatRoom: false // tells not to check for chatroom existance
          });

          const savedMessage = await this.em.save(this.em.create(ChatEntity,
               {
                    ...data,
                    chatRoom,
                    senderId
               }));

          const message = await this.em.findOne(ChatEntity, { where: { id: savedMessage.id }, relations: { parentChat: { sender: true } } })

          return { message, chatUsers }
     }
}
