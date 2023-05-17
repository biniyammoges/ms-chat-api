import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPaylaod } from "../dtos/jwt-auth.dto";
import { AuthService } from "../services/auth.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
     constructor(private readonly authService: AuthService) {
          super({
               jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
               secretOrKey: process.env.ACCESS_TOKEN_SECRET,
               ignoreExpiration: false
          })
     }

     async validate(payload: JwtPaylaod) {
          return this.authService.validateAuth(payload);
     }
}