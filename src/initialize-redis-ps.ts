import { RedisService } from "./shared/modules/redis/redis.service";
import { RedisEmitterService } from "./shared/modules/redis-emitter/redis-emitter.service";
import { REDIS_EMIT_TO_ALL, REDIS_EMIT_TO_ONE, REDIS_EMIT_TO_ROOM, REDIS_EMIT_TO_SELF } from "./shared/modules/redis-emitter/redis-emitter.constant";
import { RedisEmitEventToOneDto, RedisEmitRoomEventDto } from "./shared/modules/redis-emitter/dto/redis-emit.dto";
import { INestApplication, Logger } from "@nestjs/common";
import { SOCKET_STATE_TOKEN } from "./shared/modules/socket-state/socket-state.constant";
import { SocketStateService } from "./shared/modules/socket-state/socket-state.service";


export const initalizeRedisSubscriber = (app: INestApplication): INestApplication => {
     const redisService = app.get(RedisService);

     const logger = new Logger('Initialize-redis-ps')

     redisService.subscribe<RedisEmitEventToOneDto>(REDIS_EMIT_TO_ONE)
          .catch((err) => logger.log(err));

     redisService.subscribe<RedisEmitEventToOneDto>(REDIS_EMIT_TO_SELF)
          .catch((err) => logger.log(err));

     redisService.subscribe(REDIS_EMIT_TO_ALL)
          .catch((err) => logger.log(err))

     redisService.subscribe<RedisEmitRoomEventDto>(REDIS_EMIT_TO_ROOM)
          .catch((err) => logger.log(err))

     return app;
}
