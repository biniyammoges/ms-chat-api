export class RedisEmitEventDto {
     readonly event: string;
     readonly data: unknown;
}

export class RedisEmitEventToOneDto extends RedisEmitEventDto {
     readonly userId: string;
     readonly socketId: string;
}