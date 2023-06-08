import { Injectable, Logger } from "@nestjs/common";
import { Server } from 'socket.io'
import { RedisService } from "../redis/redis.service";
import { REDIS_EMIT_TO_ALL, REDIS_EMIT_TO_ONE, REDIS_EMIT_TO_ROOM, REDIS_EMIT_TO_SELF } from "./redis-emitter.constant";
import { RedisEmitEventDto, RedisEmitEventToOneDto, RedisEmitRoomEventDto } from "./dto/redis-emit.dto";

@Injectable()
export class RedisEmitterService {
     constructor(
          private readonly redisService: RedisService,
     ) { }

     private readonly logger = new Logger(RedisEmitterService.name);

     emitToSelf(eventInfo: RedisEmitEventToOneDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_SELF, eventInfo);
          return true
     }

     emitToOne(eventInfo: RedisEmitEventToOneDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_ONE, eventInfo);
          return true
     }

     emitToRoom(eventInfo: RedisEmitRoomEventDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_ROOM, eventInfo)
          return true
     }

     emitToAll(eventInfo: RedisEmitEventDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_ALL, eventInfo)
          return true
     }
}