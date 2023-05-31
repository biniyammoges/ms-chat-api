import { Module } from "@nestjs/common";
import { SocketStateModule } from "./socket-state/socket-state.module";
import { RedisModule } from "./redis/redis.module";

@Module({
     imports: [SocketStateModule, RedisModule],
     exports: [SocketStateModule, RedisModule]
})
export class SharedModule { }