import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, RelationOptions, Relation, FindOptionsRelations } from 'typeorm';
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

     async findUserByUsername(username: string) {
          const user = await this.userRepo.findOneBy({ username });
          if (!user) {
               throw new BadRequestException('User not found with provided username')
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
}
