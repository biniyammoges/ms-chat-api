import { Type } from "class-transformer";
import { IsDate, IsEmail, IsOptional, Length } from "class-validator";

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

     @Length(8, 30)
     confirmPassword: string;

     @IsOptional()
     @Type(() => Date)
     @IsDate({ message: "Date of birth must be a date instance", })
     dateOfBirth: string;

     @IsOptional()
     @Length(10, 60)
     bio?: string
}