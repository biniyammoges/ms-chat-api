import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class SavePostStatusDto {
     @IsOptional()
     @IsBoolean()
     @Transform(({ value }) => value === 'true' ? true : false)
     unsave: boolean
}