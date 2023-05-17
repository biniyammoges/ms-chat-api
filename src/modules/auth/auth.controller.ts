import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SignUpDto } from "./dtos/signup.dto";
import { AuthService } from "./services/auth.service";
import { JwtResponse } from "./dtos/jwt-auth.dto";
import { SignInDto } from "./dtos/signin.dto";
import { IsPublic } from "../../shared/public.decorator";
import { JwtRefreshGuard } from "./guards/rt.guard";
import { GetUser } from "../../shared/get-user.decrator";
import { UserDto } from "../user/dtos/user.dto";
import { JwtAuthGuard } from "./guards/at.guard";
import { UserEntity } from "../user/entities/user.entity";

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
     constructor(private authService: AuthService) { }

     @IsPublic()
     @Post('/signup')
     async signUpLocal(@Body() signupDto: SignUpDto): Promise<JwtResponse> {
          return this.authService.signUpLocal(signupDto);
     }

     @IsPublic()
     @Post('/login')
     async signupLocal(@Body() signInDto: SignInDto): Promise<JwtResponse> {
          return this.authService.signInLocal(signInDto);
     }

     @Get('logout')
     async logout(@GetUser('id') userId: string) {
          return this.authService.signOut(userId)
     }

     @IsPublic()
     @UseGuards(JwtRefreshGuard)
     @Get('refresh-access-token')
     async signPut(@GetUser() user: UserEntity): Promise<JwtResponse> {
          return this.authService.refreshAccessToken(user);
     }

     @Get('me')
     async getMe(@GetUser('id') userId: string): Promise<UserDto> {
          return this.authService.getMe(userId);
     }
}