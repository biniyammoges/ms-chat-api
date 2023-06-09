import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { SocketEvents } from "../shared";
import { RedisEmitterService } from "../shared/modules/redis-emitter/redis-emitter.service";
import { AuthSocket } from "../shared/modules/socket-state/socket.adapter";

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
     constructor(private redisEmitterService: RedisEmitterService) {
          super()
     }

     catch(exception: WsException | HttpException, host: ArgumentsHost) {
          const client = host.switchToWs().getClient() as AuthSocket;
          const error = exception instanceof WsException ? exception.getError() : exception.getResponse();
          const details = error instanceof Object ? { ...error } : { message: error };

          this.redisEmitterService.emitToSelf({
               data: { id: client.id, ...details },
               socketId: client.id,
               event: SocketEvents.ERROR,
               userId: client.data.user.id
          });
     }
}