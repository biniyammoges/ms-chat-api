import { Inject, Injectable } from "@nestjs/common";
import { REDIS_PUBLISHER_TOKEN, REDIS_SUBSCRIBER_TOKEN } from "./redis.contants";
import { RedisClient } from "./redis.provider";

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
          private readonly redisPublisher: RedisClient) { }

     async subscribe<T extends RedisSubscribeMessage>(event: string): Promise<T> {
          return new Promise((resolve, reject) => {
               this.redisSubscriber.subscribe(event)
               this.redisSubscriber.on('message', (channel, message) => {
                    if (channel === event)
                         resolve(JSON.parse(message))
               })

               this.redisSubscriber.on('error', (err) => reject(err))
          })
     }

     async publish(channel: string, value: unknown) {
          return new Promise((resolve, reject) => {
               this.redisPublisher.publish(channel, JSON.stringify(value), (err, reply) => {
                    if (err) reject(err)
                    resolve(reply)
               })
          })
     }
}