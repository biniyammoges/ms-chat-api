import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class LikeStatusDto {
     @IsOptional()
     @IsBoolean()
     @Transform(({ value }) => value === 'true' ? true : false)
     unlike?: boolean
}