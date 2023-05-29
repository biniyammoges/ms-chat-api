import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../../shared';
import { FollowerService } from './follower.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../shared';
import { PaginationEntity } from '../../shared';
import { FollowerEntity } from './entities/follower.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class FollowerController {
     constructor(private followerService: FollowerService) { }

     // returns followers of the following user
     @Get('followers/:username')
     async getFollowers(@Param('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          return this.followerService.getFollowers(username, filter);
     }

     // return users where user with username is following
     @Get('followings/:username')
     async getFollowing(@Param('username') username: string, @Query() filter: PaginationDto): Promise<PaginationEntity<FollowerEntity>> {
          return this.followerService.getFollowers(username, filter, false);
     }

     @Get('/follow/:username')
     async followUser(@GetUser('id') followerId: string, @Param('username') username: string): Promise<FollowerEntity> {
          return this.followerService.followUser(followerId, username)
     }

     @Get('/unfollow/:username')
     async unFollowUser(@GetUser('id') followerId: string, @Param('username') username: string): Promise<any> {
          return this.followerService.unfollowUser(followerId, username)
     }
}
