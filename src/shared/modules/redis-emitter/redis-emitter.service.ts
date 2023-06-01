import { Injectable, Logger } from "@nestjs/common";
import { SocketStateService } from "../socket-state/socket-state.service";
import { RedisService } from "../redis/redis.service";
import { REDIS_EMIT_TO_ALL, REDIS_EMIT_TO_ONE } from "./redis-emitter.constant";
import { RedisEmitEventDto, RedisEmitEventToOneDto } from "./dto/redis-emit.dto";

@Injectable()
export class RedisEmitterService {
     private readonly logger = new Logger(RedisEmitterService.name);

     constructor(
          private socketStateService: SocketStateService,
          private redisService: RedisService) {
          this.redisService.subscribe(REDIS_EMIT_TO_ONE)
               .then(this.consumeEmitToOne)
               .catch(this.logger.error);

          this.redisService.subscribe(REDIS_EMIT_TO_ALL)
               .then(this.consumeEmitToAll)
               .catch(this.logger.error)
     }

     consumeEmitToOne(eventInfo: RedisEmitEventToOneDto) {
          const { event, data, userId, socketId } = eventInfo;

          const sockets = this.socketStateService.get(userId).filter(s => s.id !== socketId);
          for (const s of sockets) {
               s.emit(event, data);
          }
     }

     consumeEmitToAll(eventInfo: RedisEmitEventDto) {
          const { event, data } = eventInfo;

          const sockets = this.socketStateService.getAll();
          for (const s of sockets) {
               s.emit(event, data)
          }
     }

     emitToOne(eventInfo: RedisEmitEventToOneDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_ONE, eventInfo);
          return true
     }

     emitToAll(eventInfo: RedisEmitEventDto): boolean {
          this.redisService.publish(REDIS_EMIT_TO_ALL, eventInfo)
          return true
     }
}