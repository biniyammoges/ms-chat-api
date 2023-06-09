import { UserDto } from "src/modules/user/dtos/user.dto";
import { BaseDto } from "src/shared";

export class BaseFollowerDto extends BaseDto {
     followerId: string;
     follower?: UserDto
     followeeId: string;
     followee?: UserDto
}