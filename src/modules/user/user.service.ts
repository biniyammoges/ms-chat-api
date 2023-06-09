import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

     async findUserById(id: string): Promise<UserDto> {
          const user = await this.userRepo.findOne({ where: { id }, relations: { avatar: true } },);
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

          await this.em.update(UserEntity, { id: userId }, { avatarId: data.fileId });
          return file
     }
}
