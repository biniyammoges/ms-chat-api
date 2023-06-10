import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RedisEmitterModule } from '../../shared/modules/redis-emitter/redis-emitter.module';
import { NotificationTransformer } from './notification.transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), RedisEmitterModule, UserModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationTransformer],
  exports: [NotificationService, NotificationTransformer]
})
export class NotificationModule { }
