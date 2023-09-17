import { Body, Inject, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException, WsResponse } from "@nestjs/websockets";
import { WebsocketExceptionsFilter } from "../../exceptions/ws-exception";
import { ChatService } from "./chat.service";
import { ChatSocketEvents, getChatRoomId } from "../../shared";
import { JoinChatRoomDto, LeaveChatRoomDto } from "./dtos/join-or-leave-chat-room.dto";
import { AuthSocket } from "../../shared/modules/socket-state/socket.adapter";
import { RedisEmitterInterceptor } from "../../shared/modules/redis-emitter/redis-emitter.interceptor";
import { CreateChatDto } from "./dtos/create-chat.dto";
import { TypingDto } from "./dtos/typing.dto";
import { RedisEmitterService } from "../../shared/modules/redis-emitter/redis-emitter.service";
import { ChatRoomIdDto } from "./dtos/chat-room-id.dto";
import { SocketStateService } from "../../shared/modules/socket-state/socket-state.service";
import { SOCKET_STATE_TOKEN } from "../../shared/modules/socket-state/socket-state.constant";
import { BaseChatDto } from "./dtos/base-chat-room.dto";

@WebSocketGateway({ cors: { origin: '*' } })
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway {
     constructor(
          private chatService: ChatService,
          private redisEmitterService: RedisEmitterService,
          @Inject(SOCKET_STATE_TOKEN)
          private socketStateService: SocketStateService,
     ) { }

     @SubscribeMessage(ChatSocketEvents.JoinChatRoom)
     async joinChatRoom(@ConnectedSocket() socket: AuthSocket, @Body() data: JoinChatRoomDto): Promise<WsResponse> {
          const chatRoom = await this.chatService.findOrCreateChatRoom(data, socket.data.user.id);
          const roomId = await getChatRoomId(chatRoom.id);

          if (socket.rooms.has(roomId)) {
               throw new WsException('You are already in room')
          }

          socket.join(roomId)
          this.socketStateService.syncSocketRoom({ roomId, socketId: socket.id, userId: socket.data.user.id })
          return { data: chatRoom, event: ChatSocketEvents.JoinedChatRoom }
     }

     @SubscribeMessage(ChatSocketEvents.leaveChatRoom)
     async leaveChatRoom(@ConnectedSocket() socket: AuthSocket, @Body() data: LeaveChatRoomDto): Promise<WsResponse> {
          const roomId = await getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException('You are already not in room')
          }

          socket.leave(roomId)
          this.socketStateService.syncSocketRoom({ roomId, socketId: socket.id, userId: socket.data.user.id }, { join: false })
          return { data: { roomId }, event: ChatSocketEvents.leftChatRoom }
     }

     @SubscribeMessage(ChatSocketEvents.SendMessage)
     @UseInterceptors(RedisEmitterInterceptor)
     async sendMessage(@ConnectedSocket() socket: AuthSocket, @Body() data: CreateChatDto): Promise<WsResponse<BaseChatDto>> {
          const senderId = socket.data.user.id;
          const { chatUsers, message } = await this.chatService.sendMessage(data, senderId, socket.id)

          if (chatUsers?.length) {
               for (const cu of chatUsers) {
                    this.redisEmitterService.emitToOne({
                         data: { ...message, sender: socket.data.user },
                         event: ChatSocketEvents.NewMessage,
                         userId: cu.userId,
                         socketId: socket.id
                    })
               }
          }

          return { data: { ...message, sender: socket.data.user }, event: ChatSocketEvents.MessageSent }
     }

     @SubscribeMessage(ChatSocketEvents.Typing)
     async onTypying(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: TypingDto): Promise<WsResponse> {
          const roomId = getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException(`Join chat room to emit ${ChatSocketEvents.Typing} event`)
          }

          await this.redisEmitterService.emitToOne({ data: { ...data, typerId: socket?.data?.user?.id }, event: ChatSocketEvents.Typing, userId: data.recipientId, socketId: socket.id })
          return { event: ChatSocketEvents.TypingSent, data }
     }

     @SubscribeMessage(ChatSocketEvents.StoppedTyping)
     async onStopTypying(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: TypingDto): Promise<WsResponse> {
          const roomId = getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException(`Join chat room to emit ${ChatSocketEvents.StoppedTyping} events`)
          }

          await this.redisEmitterService.emitToOne({ data: { ...data, typerId: socket?.data?.user?.id }, event: ChatSocketEvents.StoppedTyping, userId: data.recipientId, socketId: socket.id })
          return { event: ChatSocketEvents.StoppedTypingSent, data }
     }

     @SubscribeMessage(ChatSocketEvents.Seen)
     @UseInterceptors(RedisEmitterInterceptor)
     async markMessageAsSeen(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: ChatRoomIdDto): Promise<WsResponse> {
          const { seenCount, chatUsers } = await this.chatService.maskAllMessagesAsSeen({
               chatRoomId: data.chatRoomId,
               readerId: socket.data.user.id
          })

          // emits seen event to all chat users except current socket
          for (const cu of chatUsers) {
               await this.redisEmitterService.emitToOne({
                    event: ChatSocketEvents.Seen,
                    data: { ...data, seenCount },
                    userId: cu.userId,
                    socketId: socket.id,
               })
          }

          return { event: ChatSocketEvents.SentSeen, data: { seenCount, ...data } }
     }
}