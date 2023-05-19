import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/shared/get-user.decrator';

@Controller()
export class FollowerController {
     @Get('followers/:username')
     async getFollowers(@GetUser('username') username: string) {
          // todo - fetch followers
     }

     @Get('following/:username')
     async getFollowing(@GetUser('username') username: string) {
          // todo - fetch followings
     }

     @Get('follow/count')
     async getFollowerCount(@GetUser('id') username: string) {
          // todo - fetch follower count
     }
}
