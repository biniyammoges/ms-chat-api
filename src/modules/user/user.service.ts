import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, FindOptionsRelations } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserTransformer } from './transformer/user.transformer';
import { UserDto } from './dtos/user.dto';
import { UploadAvatarDto } from './dtos/upload-avatar.dto';
import { FileEntity } from '../file/file.entity';

@Injectable()
export class UserService {
     constructor(
          @InjectRepository(UserEntity)
          public userRepo: Repository<UserEntity>,
          private userTransformer: UserTransformer,
          @InjectEntityManager()
          private em: EntityManager
     ) { }

     private logger = new Logger(UserService.name)

     async findUserById(id: string, relations: FindOptionsRelations<UserEntity> = {}): Promise<UserDto> {
          const user = await this.userRepo.findOne({ where: { id }, relations });
          if (!user) {
               throw new BadRequestException('User not found with provided id')
          }

          return this.userTransformer.entityToDto(user)
     }

     private async checkFileValidity(userId: string, fileId: string) {
          const file = await this.em.findOne(FileEntity, { where: { id: fileId, creatorId: userId } });
          if (!file)
               throw new NotFoundException('File Not Found')

          return file
     }

     /**
      * @desc check if username is already taken and return true if not taken otherwise false
      * @param username - string
      * @returns true or false value
      */
     async checkUsername(username: string) {
          const count = await this.userRepo.count({ where: { username } });
          return { valid: !count }
     }

     async findUserByUsername(username: string, relations?: Record<string, boolean>) {
          const qry = await this.em.createQueryBuilder(UserEntity, 'u')
               .where('u.username = :username', { username })
               .leftJoinAndSelect('u.avatar', 'avatar');

          if (relations.followerCount) {
               qry.loadRelationCountAndMap('u.followerCount', 'u.followers')
                    .loadRelationCountAndMap('u.followingCount', 'u.followings')
          }

          if (relations.postCount) {
               qry.loadRelationCountAndMap('u.postCount', 'u.posts')
          }

          const user = await qry.getOne();

          if (!user) {
               throw new BadRequestException(`No user with username ${username}`)
          }

          return this.userTransformer.entityToDto(user);
     }

     async uploadAvatar(userId: string, data: UploadAvatarDto) {
          const file = await this.checkFileValidity(userId, data.fileId);
          const user = await this.findUserById(userId)

          const runner = await this.em.connection.createQueryRunner()
          await runner.connect()
          await runner.startTransaction()

          try {
               await runner.manager.update(UserEntity, { id: userId }, { avatarId: data.fileId });
               if (user.avatarId) {
                    await runner.manager.delete(FileEntity, { id: user.avatarId })
               }
               await runner.commitTransaction()
               return file
          } catch (err) {
               this.logger.error(err)
               await runner.rollbackTransaction()
          } finally {
               await runner.release()
          }
     }

     async updateLastSeen(userId: string, opts: { markAsOnline: boolean } = { markAsOnline: false }) {
          await this.em.update(UserEntity,
               { id: userId },
               {
                    isOnline: opts.markAsOnline,
                    lastSeen: opts.markAsOnline ? null : new Date()
               })
     }

     async searchUser(kywrd: string, searcher: string) {
          const users = await this.em.createQueryBuilder(UserEntity, 'u')
               .where('LOWER(u.firstName) LIKE (:fKey)', { fKey: `%${kywrd}%` })
               .orWhere('LOWER(u.lastname) LIKE (:lKey)', { lKey: `%${kywrd}%` })
               .orWhere('LOWER(u.email) LIKE (:eKey)', { eKey: `%${kywrd}%` })
               .orWhere('LOWER(u.username) LIKE (:uKey)', { uKey: `%${kywrd}%` })
               .leftJoinAndSelect('u.avatar', 'avatar')
               .getMany();

          return users.map(u => this.userTransformer.entityToDto(u))
     }
}
