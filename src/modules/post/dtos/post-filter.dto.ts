import { IsOptional, IsString, Matches } from "class-validator";
import { PaginationDto } from "../../../shared";

export class PostFilterDto extends PaginationDto {
     @Matches(/^[a-zA-Z0-9._]{1,30}$/)
     @IsString()
     @IsOptional()
     username?: string
}