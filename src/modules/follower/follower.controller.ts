import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../../shared';
import { FollowerService } from './follower.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../shared';
import { PaginationEntity } from '../../shared';
import { FollowerEntity } from './entities/follower.entity';
import { BaseFollowerDto } from './dtos/base-follower.dto';
import { FollowerTransformer } from './transformers/follower.transformer';
import { UserEntity } from '../user/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class FollowerController {
     constructor(private followerService: FollowerService, private followerTransformer: FollowerTransformer) { }

     // returns followers of the following user
     @Get('followers/:username')
     async getFollowers(@Param('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<BaseFollowerDto>> {
          const { data: followers, total } = await this.followerService.getFollowers(username, filter);
          return { data: followers.map(follower => this.followerTransformer.entityToDto(follower)), total }
     }

     // return users where user with username is following
     @Get('followings/:username')
     async getFollowing(@Param('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<BaseFollowerDto>> {
          const { data: followings, total } = await this.followerService.getFollowers(username, filter, false);
          return { data: followings.map(following => this.followerTransformer.entityToDto(following)), total }
     }

     @Get('/follow/:username')
     async followUser(@GetUser() follower: UserEntity, @Param('username') username: string): Promise<BaseFollowerDto> {
          return this.followerService.followUser({ id: follower.id, username: follower.username }, username)
     }

     @Get('/unfollow/:username')
     async unFollowUser(@GetUser('id') followerId: string, @Param('username') username: string): Promise<any> {
          return this.followerService.unfollowUser(followerId, username)
     }
}
