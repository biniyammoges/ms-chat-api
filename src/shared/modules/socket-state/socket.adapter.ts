import { INestApplication, WebSocketAdapter } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import socketio from 'socket.io'
import { SocketStateService } from "./socket-state.service";
import { WsException } from "@nestjs/websockets";
import { AuthService } from "src/modules/auth/services/auth.service";
import { UserDto } from "src/modules/user/dtos/user.dto";
import { SocketEvents } from "../../../shared/enums";
import { UserService } from "../../../modules/user/user.service";

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

               const accessToken = authorization?.split(' ')[1];
               if (!accessToken) {
                    next(new WsException('Unauthorized'))
               }

               try {
                    const { sub: userId } = await authService.verifyAccessToken(accessToken);

                    const user = await authService.getMe(userId);
                    socket.data.user = user;
                    next()
               } catch (err) {
                    next(new WsException('Unauthorized'))
               }
          })

          return server;
     }

     async bindClientConnect(server: socketio.Server, callback: Function): Promise<void> {
          const userService = this.app.get(UserService);

          server.on(SocketEvents.Connection, async (socket: AuthSocket) => {
               this.socketStateService.add(socket.data.user.id, socket)
               await userService.updateLastSeen(socket.data.user.id, { markAsOnline: true })

               socket.on(SocketEvents.Disconnect, async () => {
                    this.socketStateService.remove(socket.data.user.id, socket)
                    await userService.updateLastSeen(socket.data.user.id, { markAsOnline: false })
                    socket.removeAllListeners(SocketEvents.Disconnect)
               })

               callback(socket)
          })
     }
}