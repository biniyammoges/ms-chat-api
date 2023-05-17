import { IsEmail, Length } from "class-validator";

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


     phone?: string;
     bio?: string;
     location?: string;
     website?: string;
     birthDate: Date;
}