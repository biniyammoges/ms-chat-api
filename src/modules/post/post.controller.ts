import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/at.guard';
import { CreatePostDto, CommentIdDto, LikeStatusDto, PostIdDto, CreateCommentDto, BasePostDto, BasePostLikeDto, BaseCommentDto } from './dtos';
import { GetUser, PaginationEntity } from '../../shared';

import { SavePostStatusDto } from './dtos/save-post-status.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { UserEntity } from '../user/entities/user.entity';
import { PostTransformer } from './transformers/post.transformer';
import { PostLikeTransformer } from './transformers/like.transformer';
import { CommentTransformer } from './transformers/comment.transformer';
import { ValidateUsernameDto } from '../user/dtos/validate-username.dto';
import { PostFilterDto } from './dtos/post-filter.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService,
    private postTransformer: PostTransformer,
    private postLikeTransformer: PostLikeTransformer,
    private commentTransformer: CommentTransformer,
  ) { }

  @Post('post/create')
  async create(@Body() data: CreatePostDto, @GetUser() user: UserEntity) {
    return this.postService.create({ ...data, creatorId: user.id, creatorUsername: user.username })
  }

  @Put('post/:postId/update')
  async updatePost(@GetUser('id') updaterId: string, @Body() updatePostDto: UpdatePostDto, @Param() postIdDto: PostIdDto): Promise<BasePostDto> {
    return this.postService.updatePost(postIdDto.postId, updatePostDto, updaterId)
  }

  @Delete('post/:postId/delete')
  async deletePost(@Param() postIdDto: PostIdDto, @GetUser('id') userId: string): Promise<any> {
    return this.postService.deletePost(postIdDto.postId, userId)
  }

  @Get('post/retrieve/feed')
  async retrievePosts(@GetUser('id') fetcherId: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1, @Query() usernameDto: PostFilterDto): Promise<PaginationEntity<BasePostDto>> {
    const { data: posts, total } = await this.postService.retrievePosts(fetcherId, { limit, page, username: usernameDto.username })
    return { data: posts.map(post => this.postTransformer.entityToDto(post)), total }
  }

  @Get('post/retrieve/:id')
  async retrieveOnePost(@Param('id') id: string): Promise<BasePostDto> {
    const post = await this.postService.retrieveOnePost(id)
    return this.postTransformer.entityToDto(post)
  }

  @Get('post/retrieve/me')
  async retrieveMyPosts(@GetUser('id') id: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BasePostDto>> {
    const { data: posts, total } = await this.postService.retrieveMyPosts(id, { limit, page })
    return { data: posts.map(post => this.postTransformer.entityToDto(post)), total }
  }

  @Get('post/:postId/like')
  async likePost(@GetUser() liker: UserEntity, @Param() postIdDto: PostIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likePost(postIdDto, liker, !!likeStatusDto.unlike)
  }

  @Get('post/:postId/likes')
  async retrievePostLikes(@Param() postIdDto: PostIdDto, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BasePostLikeDto>> {
    const { data: likes, total } = await this.postService.retrievePostLikes(postIdDto, { limit, page })
    return { data: likes.map(like => this.postLikeTransformer.entityToDto(like)), total }
  }

  @Get('post/:postId/save')
  async savePost(@GetUser('id') userId: string, @Param() postIdDto: PostIdDto, @Query() savePostStatusDto: SavePostStatusDto) {
    return this.postService.savePost(postIdDto, userId, !!savePostStatusDto.unsave)
  }

  @Get('post/retrieve/saved')
  async retrieveSaved(@GetUser('id') userId: string) {
    return this.postService.retrieveSavedPosts(userId)
  }

  @Post('comment/create')
  async createComment(@GetUser() user: UserEntity, @Body() commentDto: CreateCommentDto): Promise<BaseCommentDto> {
    return this.postService.createComment(commentDto, user)
  }

  @Get('comment/:commentId/like')
  async likeComment(@GetUser() liker: UserEntity, @Param() commentIdDto: CommentIdDto, @Query() likeStatusDto: LikeStatusDto) {
    return this.postService.likeComment(commentIdDto, liker, !!likeStatusDto.unlike)
  }

  @Get('post/:postId/comments')
  async retrieveComments(@Param() postIdDto: PostIdDto, @GetUser('id') userId: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseCommentDto>> {
    const { data: comments, total } = await this.postService.retrieveComments(postIdDto, userId, { limit, page })
    return { data: comments.map(comment => this.commentTransformer.entityToDto(comment)), total }
  }

  @Get('comment/:commentId/replies')
  async retrieveCommentReplies(@Param() commentIdDto: CommentIdDto, @GetUser('id') userId: string, @Query('limit') limit: number = 20, @Query('page') page: number = 1): Promise<PaginationEntity<BaseCommentDto>> {
    const { data: replies, total } = await this.postService.retrieveCommentReplies(commentIdDto, userId, { limit, page })
    return { data: replies.map(comment => this.commentTransformer.entityToDto(comment)), total }
  }

  @Put('comment/:commentId/update')
  async updateComment(@GetUser('id') updaterId: string, @Body() updateCommentDto: UpdateCommentDto, @Param() commentIdDto: CommentIdDto): Promise<any> {
    return this.postService.updateComment(commentIdDto.commentId, updateCommentDto, updaterId)
  }

  @Delete('comment/:commentId/delete')
  async deleteComment(@Param() commentIdDto: CommentIdDto, @GetUser('id') userId: string): Promise<any> {
    return this.postService.deleteComment(commentIdDto.commentId, userId)
  }
}
