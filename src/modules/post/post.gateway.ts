import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException, WsResponse } from '@nestjs/websockets';
import { SocketPostEvents } from '../../shared';
import { PostService } from './post.service';
import { JoinPostRoomDto } from './dtos/join-post-room.dto';
import { SOCKET_STATE_TOKEN } from '../../shared/modules/socket-state/socket-state.constant';
import { SocketStateService } from '../../shared/modules/socket-state/socket-state.service';
import { AuthSocket } from '../../shared/modules/socket-state/socket.adapter';
import { WebsocketExceptionsFilter } from '../../exceptions/ws-exception';

@WebSocketGateway()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(WebsocketExceptionsFilter)
export class PostGateway {
  constructor(private postService: PostService,
    @Inject(SOCKET_STATE_TOKEN)
    private socketStateService: SocketStateService
  ) { }

  @SubscribeMessage(SocketPostEvents.JOIN_POST_ROOM)
  async joinPostRoom(@MessageBody() body: JoinPostRoomDto, @ConnectedSocket() socket: AuthSocket): Promise<WsResponse> {
    const { postId } = body
    const post = this.postService.findById(postId)
    if (!post) {
      throw new WsException('Post Not Found')
    }

    const roomId = `post:${postId}`
    if (socket.rooms.has(roomId)) {
      throw new WsException('You are already in room')
    }

    socket.join(roomId)
    this.socketStateService.syncSocketRoom({ roomId, socketId: socket.id, userId: socket.data.user.id })
    return { event: SocketPostEvents.JOINED_POST_ROOM, data: { roomId } }
  }

  @SubscribeMessage(SocketPostEvents.LEAVE_POST_ROOM)
  async leavePostRoom(@MessageBody() body: JoinPostRoomDto, @ConnectedSocket() socket: AuthSocket): Promise<WsResponse> {
    const { postId } = body
    const post = this.postService.findById(postId)
    if (!post) {
      throw new WsException('Post Not Found')
    }

    const roomId = `post:${postId}`
    if (!socket.rooms.has(roomId)) {
      throw new WsException('You are already not in room')
    }

    socket.leave(roomId)
    this.socketStateService.syncSocketRoom({ roomId, socketId: socket.id, userId: socket.data.user.id }, { join: false })
    return { event: SocketPostEvents.LEFT_POST_ROOM, data: { roomId } }
  }
}
