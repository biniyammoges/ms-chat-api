import { Injectable } from "@nestjs/common";
import { UserTransformer } from "../../user/transformer/user.transformer";
import { FollowerEntity } from "../entities/follower.entity";
import { BaseFollowerDto } from "../dtos/base-follower.dto";

@Injectable()
export class FollowerTransformer {
     constructor(private userTransformer: UserTransformer) { }

     entityToDto(entity: FollowerEntity, opts?: Record<string, never>) {
          const result: BaseFollowerDto = {
               ...entity,
               ...(entity.followee && { followee: this.userTransformer.entityToDto(entity.followee) }),
               ...(entity.follower && { follower: this.userTransformer.entityToDto(entity.follower) }),
          }

          return result
     }
}