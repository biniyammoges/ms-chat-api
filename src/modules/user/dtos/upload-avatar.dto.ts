import { IsUUID } from "class-validator";

export class UploadAvatarDto {
     @IsUUID()
     fileId: string
}