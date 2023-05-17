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
     avatar?: File;
     avatarId?: string;
     birthDate: Date;
};