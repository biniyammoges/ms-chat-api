import { Provider } from "@nestjs/common";
import * as Redis from "ioredis";
import { REDIS_PUBLISHER_TOKEN, REDIS_SUBSCRIBER_TOKEN } from "./redis.contants";

export type RedisClient = Redis.Redis


export const redisProviders: Provider[] = [
     {
          useFactory: (): RedisClient => {
               return new Redis.Redis({
                    host: process.env.REDIS_HOST || "redis",
                    port: parseInt(process.env.REDIS_POST) || 6379,
                    enableReadyCheck: false,
                    maxRetriesPerRequest: null
               })
          },
          provide: REDIS_SUBSCRIBER_TOKEN
     },
     {
          useFactory: (): RedisClient => {
               return new Redis.Redis({
                    host: process.env.REDIS_HOST || "redis",
                    port: parseInt(process.env.REDIS_POST) || 6379,
                    enableReadyCheck: false,
                    maxRetriesPerRequest: null
               })
          },
          provide: REDIS_PUBLISHER_TOKEN
     },
]