import { INestApplication, WebSocketAdapter } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import socketio from 'socket.io'
import { SocketStateService } from "./socket-state.service";
import { WsException } from "@nestjs/websockets";
import { AuthService } from "src/modules/auth/services/auth.service";
import { UserDto } from "src/modules/user/dtos/user.dto";
import { SocketEvents } from "src/shared/enums";

export type AuthSocket = socketio.Socket & { data: { user: UserDto } }


export class SocketAdapter extends IoAdapter implements WebSocketAdapter {
     constructor(private app: INestApplication, private socketStateService: SocketStateService) {
          super(app)
     }

     create(port: number, options?: ServerOptions & { namespace?: string; server?: any; }): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
          const server = super.createIOServer(port, options) as socketio.Server;
          const authService = this.app.get(AuthService);

          server.use(async (socket: socketio.Socket, next: Function) => {
               const { handshake: { headers: { authorization } } } = socket;

               const accessToken = authorization.split(' ')[1];
               if (!accessToken) throw new WsException('Unauthorized')

               const { sub: userId } = await authService.verifyAccessToken(accessToken);

               const user = await authService.getMe(userId);
               socket.data.user = user;
          })

          return server;
     }

     bindClientConnect(server: socketio.Server, callback: Function): void {
          server.on(SocketEvents.CONNECTION, (socket: AuthSocket) => {
               this.socketStateService.add(socket.data.user.id, socket)

               callback(socket)
          })
     }

     bindClientDisconnect(socket: AuthSocket, callback: Function): void {
          const { data: { user: { id: userId } } } = socket;
          this.socketStateService.remove(userId, socket)
          socket.removeAllListeners(SocketEvents.DISCONNECT)
     }
}