import { Module } from "@nestjs/common";
import { redisProviders } from "./redis.provider";
import { RedisService } from "./redis.service";
import { SocketStateModule } from "../socket-state/socket-state.module";

@Module({
     imports: [SocketStateModule],
     providers: [...redisProviders, RedisService],
     exports: [...redisProviders, RedisService]
})
export class RedisModule { }
