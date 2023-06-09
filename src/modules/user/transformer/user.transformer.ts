import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserDto } from "../dtos/user.dto";

@Injectable()
export class UserTransformer {
     entityToDto(entity: UserEntity, opts?: Record<string, never>) {
          const result: UserDto = {
               ...entity,
               ...(entity.avatar && { avatar: entity.avatar }),
          }

          return result
     }
}