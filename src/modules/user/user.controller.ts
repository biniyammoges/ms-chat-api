import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser } from '../../shared';
import { BaseFileDto } from '../file/dto/base-file.dto';
import { UploadAvatarDto } from './dtos/upload-avatar.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService,) { }

  @Post('upload/avatar')
  async uploadAvatar(@GetUser('id') userId: string, @Body() data: UploadAvatarDto): Promise<BaseFileDto> {
    return this.userService.uploadAvatar(userId, data)
  }
}
