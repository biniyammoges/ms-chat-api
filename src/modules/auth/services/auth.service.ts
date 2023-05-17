import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, IsNull, Not } from "typeorm";
import { SignUpDto } from "../dtos/signup.dto";
import { UserEntity } from "../../user/entities/user.entity";
import { JwtPaylaod, JwtResponse } from "../dtos/jwt-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from 'bcrypt'
import { SignInDto } from "../dtos/signin.dto";
import { UserTransformer } from "../../user/transformer/user.transformer";
import { UserDto } from "../../user/dtos/user.dto";

@Injectable()
export class AuthService {
     constructor(
          @InjectEntityManager()
          private em: EntityManager,
          private jwtService: JwtService,
          private userTransformer: UserTransformer,
     ) { }

     async validateAuth(payload: JwtPaylaod, isRefresh = false) {
          const user = await this.em.findOneOrFail(UserEntity, {
               where: {
                    id: payload.sub,
                    email: payload.email,
                    ...(isRefresh && { refreshToken: Not(IsNull()) })
               }
          })

          if (!user) throw new UnauthorizedException('Invalid or expired token');

          return user
     }

     async signUpLocal(signUpDto: SignUpDto) {
          const userExist = await this.em.findOne(UserEntity, {
               where: [{ email: signUpDto.email }, { username: signUpDto.username }]
          });

          if (userExist) {
               throw new BadRequestException(`Email or username is already in use, please choose another one`)
          }

          const user = this.em.create(UserEntity, { ...signUpDto, password: await hash(signUpDto.password, 10) });
          await this.em.save(user)

          // generate access and refresh token
          const tokens = await this.generateJwtToken({ email: signUpDto.email, sub: user.id });
          await this.updateRefreshToken(user.id, tokens.refreshToken);

          return tokens
     }

     async signInLocal(signInDto: SignInDto): Promise<JwtResponse> {
          const user = await this.em.findOne(UserEntity, {
               where: [{ email: signInDto.emailOrUsername }, { username: signInDto.emailOrUsername }]
          });

          if (!user)
               throw new BadRequestException('Invalid email or password')

          const passwordMatch = await compare(signInDto.password, user.password);
          if (!passwordMatch)
               throw new BadRequestException('Invalid email or password')

          const tokens = await this.generateJwtToken({ sub: user.id, email: user.email });
          await this.updateRefreshToken(user.id, tokens.refreshToken);
          return tokens
     }

     async signOut(userId: string): Promise<void> {
          const user = await this.em.findOneOrFail(UserEntity, { where: { id: userId } });
          await this.em.save(UserEntity, { ...user, refreshToken: null })
     }

     async getMe(userId: string): Promise<UserDto> {
          return this.userTransformer.entityToDto(await this.em.findOne(UserEntity, { where: { id: userId } }))
     }

     async refreshAccessToken(user: UserEntity): Promise<JwtResponse> {
          const tokens = await this.generateJwtToken({ email: user.email, sub: user.id });
          await this.updateRefreshToken(user.id, tokens.refreshToken);
          return tokens
     }

     private async updateRefreshToken(id: string, refreshToken: string) {
          const user = await this.em.findOne(UserEntity, { where: { id } });
          return this.em.save(UserEntity, { ...user, refreshToken: await hash(refreshToken, 10) })
     }

     private async generateJwtToken(payload: JwtPaylaod): Promise<JwtResponse> {
          const [accessToken, refreshToken] = await Promise.all([this.jwtService.signAsync(payload, {
               expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
               secret: process.env.ACCESS_TOKEN_SECRET,
          }), this.jwtService.signAsync(payload, {
               expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
               secret: process.env.REFRESH_TOKEN_SECRET,
          })])

          return { accessToken, refreshToken }
     }
}