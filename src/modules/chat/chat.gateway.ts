import { Body, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
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

@WebSocketGateway()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseInterceptors(RedisEmitterInterceptor)
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway {
     constructor(private chatService: ChatService, private redisEmitterService: RedisEmitterService,) { }

     @SubscribeMessage(ChatSocketEvents.JoinChatRoom)
     async joinChatRoom(@ConnectedSocket() socket: AuthSocket, @Body() data: JoinChatRoomDto): Promise<WsResponse> {
          const chatRoom = await this.chatService.findOrCreateChatRoom(data, socket.data.user.id);
          const roomId = await getChatRoomId(chatRoom.id);

          if (socket.rooms.has(roomId)) {
               throw new WsException('You are already in room')
          }

          socket.join(roomId)
          return { data: { roomId }, event: ChatSocketEvents.JoinedChatRoom }
     }

     @SubscribeMessage(ChatSocketEvents.leaveChatRoom)
     async leaveChatRoom(@ConnectedSocket() socket: AuthSocket, @Body() data: LeaveChatRoomDto): Promise<WsResponse> {
          const roomId = await getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException('You are already not in room')
          }

          socket.leave(roomId)
          return { data: { roomId }, event: ChatSocketEvents.leftChatRoom }
     }

     @SubscribeMessage(ChatSocketEvents.SendMessage)
     async sendMessage(@ConnectedSocket() socket: AuthSocket, @Body() data: CreateChatDto): Promise<WsResponse> {
          const roomId = await getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException('Join chat room to send message')
          }

          const senderId = socket.data.user.id;
          await this.chatService.sendMessage(data, senderId, socket.id)
          return { data: { roomId }, event: ChatSocketEvents.MessageSent }
     }

     @SubscribeMessage(ChatSocketEvents.Typing)
     async onTypying(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: TypingDto): Promise<WsResponse> {
          const roomId = getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException(`Join chat room to emit ${ChatSocketEvents.Typing} event`)
          }

          await this.redisEmitterService.emitToRoom({ event: ChatSocketEvents.Typing, data, roomId, socketId: socket.id, })
          return { event: ChatSocketEvents.TypingSent, data }
     }

     @SubscribeMessage(ChatSocketEvents.StoppedTyping)
     async onStopTypying(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: TypingDto): Promise<WsResponse> {
          const roomId = getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException(`Join chat room to emit ${ChatSocketEvents.StoppedTyping} events`)
          }

          await this.redisEmitterService.emitToRoom({ event: ChatSocketEvents.Typing, data, roomId, socketId: socket.id, })
          return { event: ChatSocketEvents.StoppedTypingSent, data }
     }

     @SubscribeMessage(ChatSocketEvents.Seen)
     async markMessageAsSeen(@ConnectedSocket() socket: AuthSocket, @MessageBody() data: ChatRoomIdDto): Promise<WsResponse> {
          const roomId = getChatRoomId(data.chatRoomId);

          if (!socket.rooms.has(roomId)) {
               throw new WsException(`Join chat room to emit ${ChatSocketEvents.Seen} events`)
          }

          const { seenCount } = await this.chatService.maskAllMessagesAsSeen({ chatRoomId: data.chatRoomId, userId: socket.data.user.id })

          // emits seen event to all sockets in room except current socket
          await this.redisEmitterService.emitToRoom({
               event: ChatSocketEvents.Seen,
               data: { ...data, seenCount },
               roomId,
               socketId: socket.id,
          })

          return { event: ChatSocketEvents.SentSeen, data: { seenCount, ...data } }
     }

}