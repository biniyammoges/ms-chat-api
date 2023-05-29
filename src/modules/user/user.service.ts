import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserTransformer } from './transformer/user.transformer';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UserService {
     constructor(
          @InjectRepository(UserEntity)
          public userRepo: Repository<UserEntity>,
          private userTransformer: UserTransformer
     ) { }

     async findUserById(id: string): Promise<UserDto> {
          const user = await this.userRepo.findOneBy({ id });
          if (!user) {
               throw new BadRequestException('User not found with provided id')
          }

          return this.userTransformer.entityToDto(user)
     }

     async findUserByUsername(username: string) {
          const user = await this.userRepo.findOneBy({ username });
          if (!user) {
               throw new BadRequestException('User not found with provided username')
          }

          return this.userTransformer.entityToDto(user);
     }
}
