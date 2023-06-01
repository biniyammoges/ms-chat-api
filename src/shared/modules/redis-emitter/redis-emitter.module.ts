import { Module } from "@nestjs/common";
import { RedisEmitterService } from "./redis-emitter.service";
import { RedisModule } from "../redis/redis.module";
import { SocketStateModule } from "../socket-state/socket-state.module";

@Module({
     imports: [RedisModule, SocketStateModule],
     providers: [RedisEmitterService],
     exports: [RedisEmitterService]
})
export class RedisEmitterModule { }