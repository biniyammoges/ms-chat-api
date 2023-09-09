import { Type } from "class-transformer";
import { IsDate, IsEmail, IsOptional, IsPhoneNumber, IsString, IsUrl, Length } from "class-validator";

export class UpdateMeDto {
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

     @IsOptional()
     @Type(() => Date)
     @IsDate({ message: "Date of birth must be a date instance", })
     birthDate: Date;

     @IsOptional()
     @Length(10, 60)
     bio?: string

     @IsString()
     @IsOptional()
     location?: string;

     @IsUrl()
     @IsOptional()
     website?: string;
}