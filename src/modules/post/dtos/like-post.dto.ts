import { IsBoolean, IsOptional } from "class-validator";

export class LikeStatusDto {
     @IsOptional()
     @IsBoolean()
     unlike?: boolean
}