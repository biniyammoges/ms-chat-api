import { Injectable } from '@nestjs/common';
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
          return this.userTransformer.entityToDto(await this.userRepo.findOneByOrFail({ id }))
     }

     async findUserByUsername(username: string) {
          return this.userTransformer.entityToDto(await this.userRepo.findOneByOrFail({ username }))
     }
}
