import { BaseFileDto } from "src/modules/file/dto/base-file.dto";

export class UserDto {
     id: string;
     firstName: string;
     lastName: string;
     username: string;
     phone?: string;
     email?: string;
     bio?: string;
     location?: string;
     website?: string;
     avatar?: BaseFileDto;
     avatarId?: string;
     birthDate?: Date;
};