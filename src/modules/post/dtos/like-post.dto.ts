import { IsBoolean, IsOptional, IsUUID } from "class-validator";

export class LikePostDto {
     @IsUUID()
     postId: string
}

export class LikePostStatusDto {
     @IsOptional()
     @IsBoolean()
     unlike?: boolean
}