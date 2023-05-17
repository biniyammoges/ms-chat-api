import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPaylaod } from "../dtos/jwt-auth.dto";
import { AuthService } from "../services/auth.service";
import { compare } from "bcrypt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
     constructor(private authService: AuthService) {
          super({
               jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
               secretOrKey: process.env.REFRESH_TOKEN_SECRET,
               ignoreExpiration: false,
               passReqToCallback: true
          })
     }

     async validate(req: any, payload: JwtPaylaod) {
          // the second param (_, true) is telling the function to check for refresh token in user entity
          const user = await this.authService.validateAuth(payload, true);
          const refreshToken = req.headers.authorization.split(' ')[1];

          const refreshTokenMatches = await compare(refreshToken, user.refreshToken);
          if (!refreshTokenMatches) throw new UnauthorizedException('Invalid or expired refresh token')

          return user
     }
}