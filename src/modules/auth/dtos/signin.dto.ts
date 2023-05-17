import { IsNotEmpty, MinLength } from "class-validator"

export class SignInDto {
     @IsNotEmpty()
     emailOrUsername: string

     @MinLength(8)
     password: string
}