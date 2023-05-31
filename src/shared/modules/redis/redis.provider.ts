import { Provider } from "@nestjs/common";
import * as Redis from "ioredis";
import { REDIS_PUBLISHER_TOKEN, REDIS_SUBSCRIBER_TOKEN } from "./redis.contants";

export type RedisClient = Redis.Redis


export const redisProviders: Provider[] = [
     {
          useFactory: (): RedisClient => {
               return new Redis.Redis({ host: "redis", port: 6379 })
          },
          provide: REDIS_SUBSCRIBER_TOKEN
     },
     {
          useFactory: (): RedisClient => {
               return new Redis.Redis({ host: "redis", port: 6379 })
          },
          provide: REDIS_PUBLISHER_TOKEN
     },
]