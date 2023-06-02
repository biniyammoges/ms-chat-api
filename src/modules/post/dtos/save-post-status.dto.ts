import { IsBoolean, IsOptional } from "class-validator";

export class SavePostStatusDto {
     @IsOptional()
     @IsBoolean()
     unsave: boolean
}