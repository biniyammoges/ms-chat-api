import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { WsResponse } from "@nestjs/websockets";
import { Observable, tap } from "rxjs";
import { RedisEmitterService } from "./redis-emitter.service";
import { AuthSocket } from "../socket-state/socket.adapter";

@Injectable()
export class RedisEmitterInterceptor<T> implements NestInterceptor<T, WsResponse<T>> {
     constructor(private redisEmitterService: RedisEmitterService) { }

     intercept(context: ExecutionContext, next: CallHandler): Observable<WsResponse<T>> {
          const socket = context.switchToWs().getClient() as AuthSocket;

          return next.handle().pipe(
               tap((data) =>
                    this.redisEmitterService.emitToOne(
                         { ...data, socketId: socket.id, userId: socket.data?.user?.id }
                    )))
     }
}
