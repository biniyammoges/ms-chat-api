import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { GetUser, IsPublic } from '../../shared';
import { BaseFileDto } from '../file/dto/base-file.dto';
import { UploadAvatarDto } from './dtos/upload-avatar.dto';
import { ValidateUsernameDto } from './dtos/validate-username.dto';
import { SearchUserDto } from './dtos/search-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService,) { }

  @Post('upload/avatar')
  async uploadAvatar(@GetUser('id') userId: string, @Body() data: UploadAvatarDto): Promise<BaseFileDto> {
    return this.userService.uploadAvatar(userId, data)
  }

  @IsPublic()
  @Post('validate-username')
  async checkUsername(@Body() validateUsernameDto: ValidateUsernameDto) {
    return this.userService.checkUsername(validateUsernameDto.username)
  }

  @Get('search')
  async searchUser(@Query() qry: SearchUserDto, @GetUser('id') userId: string) {
    return this.userService.searchUser(qry.keyword, userId)
  }

  @Get('find/:username')
  async findByUsername(@Param() usernameDto: ValidateUsernameDto) {
    return this.userService.findUserByUsername(usernameDto.username, { postCount: true, followerCount: true })
  }
}
