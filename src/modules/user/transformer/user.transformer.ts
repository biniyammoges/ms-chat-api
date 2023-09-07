import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserDto } from "../dtos/user.dto";

@Injectable()
export class UserTransformer {
     entityToDto(entity: UserEntity, opts?: Record<string, never>) {
          const result: UserDto = {
               id: entity.id,
               email: entity.email,
               username: entity.username,
               firstName: entity.firstName,
               lastName: entity.lastName,
               ...(entity.birthDate && { birthDate: entity.birthDate }),
               ...(entity.bio && { bio: entity.bio }),
               ...(entity.location && { location: entity.location }),
               ...(entity.phone && { phone: entity.phone }),
               ...(entity.avatarId && { avatarId: entity.avatarId }),
               ...(entity.avatar && { avatar: entity.avatar }),
               ...(entity?.followerCount && { followerCount: entity.followerCount }),
               ...(entity?.followingCount && { followingCount: entity.followingCount }),
               ...(entity?.postCount && { postCount: entity.postCount }),
          }

          return result
     }
}