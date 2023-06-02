import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { GetUser, PaginationDto } from '../../shared';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post('create')
  async create(@Body() data: CreatePostDto, @GetUser('id') creatorId: string) {
    return this.postService.create({ ...data, creatorId })
  }

  @Get('retireve')
  async retrievePosts(@GetUser('id') fetcherId: string, @Query() filter: PaginationDto) {
    return this.postService.retrievePosts(fetcherId, filter)
  }

  @Get('retrieve/me')
  async retrieveMyPosts(@GetUser('id') id: string, @Query() filter: PaginationDto) {
    return this.postService.retrieveMyPosts(id, filter)
  }
}
