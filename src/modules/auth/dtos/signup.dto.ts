import { IsEmail, IsPhoneNumber, Length, ValidateIf } from "class-validator";

export class SignUpDto {
     @Length(3, 30)
     firstName: string;

     @Length(3, 30)
     lastName: string;

     @Length(3, 30)
     username: string;

     @IsEmail()
     email: string;

     @Length(8, 30)
     password: string;
}