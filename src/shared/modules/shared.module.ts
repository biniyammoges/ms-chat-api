import { Module } from "@nestjs/common";
import { SocketStateModule } from "./socket-state/socket-state.module";
import { RedisModule } from "./redis/redis.module";
import { RedisEmitterModule } from "./redis-emitter/redis-emitter.module";

@Module({
     imports: [SocketStateModule, RedisModule, RedisEmitterModule],
     exports: [SocketStateModule, RedisModule, RedisEmitterModule]
})
export class SharedModule { }