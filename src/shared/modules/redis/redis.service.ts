import { Inject, Injectable, Logger } from "@nestjs/common";
import { REDIS_PUBLISHER_TOKEN, REDIS_SUBSCRIBER_TOKEN } from "./redis.contants";
import { RedisClient } from "./redis.provider";
import { RedisEmitEventDto, RedisEmitEventToOneDto, RedisEmitRoomEventDto } from "../redis-emitter/dto/redis-emit.dto";
import { SocketStateService } from "../socket-state/socket-state.service";
import { REDIS_EMIT_TO_ALL, REDIS_EMIT_TO_ONE, REDIS_EMIT_TO_ROOM, REDIS_EMIT_TO_SELF } from "../redis-emitter/redis-emitter.constant";
import { SOCKET_STATE_TOKEN } from "../socket-state/socket-state.constant";

export interface RedisSubscribeMessage {
     readonly message: string
     readonly channel: string
}

@Injectable()
export class RedisService {
     constructor(
          @Inject(REDIS_SUBSCRIBER_TOKEN)
          private readonly redisSubscriber: RedisClient,
          @Inject(REDIS_PUBLISHER_TOKEN)
          private readonly redisPublisher: RedisClient,
          @Inject(SOCKET_STATE_TOKEN)
          private socketService: SocketStateService
     ) { }

     private logger = new Logger(RedisService.name)

     async subscribe<T extends RedisEmitEventDto>(event: string): Promise<T> {
          return new Promise((resolve, reject) => {
               this.redisSubscriber.subscribe(event)
               this.redisSubscriber.on('message', (channel, message) => {
                    let data = JSON.parse(message)

                    if (channel === event && event === REDIS_EMIT_TO_ALL) {
                         this.consumeEmitToAll(data)
                    }
                    else if (channel === event && event === REDIS_EMIT_TO_SELF) {
                         this.consumeEmitToSelf(data)
                    }

                    else if (channel === event && event === REDIS_EMIT_TO_ONE) {
                         this.consumeEmitToOne(data)
                    }

                    else if (channel === event && event === REDIS_EMIT_TO_ROOM) {
                         this.consumeEmitToRoom(data)
                    }

                    resolve(JSON.parse(message))
               })

               this.redisSubscriber.on('error', (err) => {
                    reject(err)
                    this.logger.debug(err)
               })
          })
     }

     async publish(channel: string, value: unknown) {
          return new Promise((resolve, reject) => {
               this.redisPublisher.publish(channel, JSON.stringify(value), (err, reply) => {
                    if (err) {
                         this.logger.error(err)
                         reject(err)
                    }
                    resolve(reply)
               })
          })
     }

     consumeEmitToSelf(eventInfo: RedisEmitEventToOneDto) {
          const { event, data, userId, socketId: currentSocketId } = eventInfo;
          const socket = this.socketService.get(userId).find(s => s.id === currentSocketId);

          if (socket)
               socket.emit(event, data)
     }

     consumeEmitToOne(eventInfo: RedisEmitEventToOneDto) {
          const { event, data, userId, socketId: currentSocketId } = eventInfo;
          let sockets = this.socketService.get(userId);

          if (currentSocketId) {
               // excludes current socketId from getting event
               sockets = sockets.filter(s => s.id !== currentSocketId)
          }

          for (const s of sockets) {
               s.emit(event, data);
          }
     }

     consumeEmitToRoom(eventInfo: RedisEmitRoomEventDto) {
          const { event, data, roomId, socketId } = eventInfo

          const sockets = this.socketService.getSocketsInRoom(roomId, socketId)
          for (const s of sockets) {
               s.emit(event, data)
          }
     }

     consumeEmitToAll(eventInfo: RedisEmitEventDto) {
          const { event, data } = eventInfo;
          const sockets = this.socketService.getAll();

          for (const s of sockets) {
               s.emit(event, data)
          }
     }
}