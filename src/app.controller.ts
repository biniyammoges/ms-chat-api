import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./modules/auth/guards/at.guard";
import { IsPublic } from "./shared/public.decorator";

@UseGuards(JwtAuthGuard)
@Controller()
export class AppController {
     @Get()
     @IsPublic()
     status() {
          return 'Api Is Running!'
     }
}