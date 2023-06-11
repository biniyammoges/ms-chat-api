import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationTransformer } from './notification.transformer';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser, PaginationEntity } from '../../shared';
import { BaseNotificationDto } from './dtos/base-notification.dto';
import { NotificationIdDto } from './dtos/notification-id.dto';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService,
    private readonly notificationTransformer: NotificationTransformer) { }

  @Get('retrieve')
  async retrieveNotifications(@GetUser('id') receiverId: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseNotificationDto>> {
    const [notifications, total] = await this.notificationService.retrieveNotifications(receiverId, { limit, page })
    return new PaginationEntity({ data: notifications.map(n => this.notificationTransformer.entityToDto(n)), total })
  }

  @Get('/:id/read')
  async readOne(@Param() notificationIdDto: NotificationIdDto, @GetUser('id') reveiverId: string) {
    return this.notificationService.readOne(notificationIdDto.id, reveiverId)
  }

  @Get('read-all')
  async readAll(@Param() notificationIdDto: NotificationIdDto, @GetUser('id') reveiverId: string) {
    return this.notificationService.readAll(notificationIdDto.id, reveiverId)
  }
} 
