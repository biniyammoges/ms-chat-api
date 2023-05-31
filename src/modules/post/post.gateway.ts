import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io'

@WebSocketGateway({ namespace: "/post" })
export class PostGateway {
  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() socket: Socket): string {
    const data = socket.data

    return 'Hello world!';
  }
}
