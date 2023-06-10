import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RedisEmitterModule } from '../../shared/modules/redis-emitter/redis-emitter.module';
import { NotificationTransformer } from './notification.transformer';

@Module({
  imports: [RedisEmitterModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationTransformer],
  exports: [NotificationService, NotificationTransformer]
})
export class NotificationModule { }
