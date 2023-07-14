import { IsString, Matches } from "class-validator";

export class ValidateUsernameDto {
     @Matches(/^[a-zA-Z0-9._]{1,30}$/)
     @IsString()
     username: string
}