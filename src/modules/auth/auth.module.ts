import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AtStrategy } from "./strategies/at.strategy";
import { RtStrategy } from "./strategies/rt.strategy";
import { UserModule } from "../user/user.module";

@Module({
     imports: [JwtModule.register({}), UserModule],
     controllers: [AuthController],
     providers: [AuthService, AtStrategy, RtStrategy],
     exports: [AuthService]
})
export class AuthModule { }