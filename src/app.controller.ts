import { Controller, Get, UseGuards, } from "@nestjs/common";
import { IsPublic } from "./shared/public.decorator";
import { GetUser } from "./shared";
import { UserEntity } from "./modules/user/entities/user.entity";
import { AppService, GlobalAppData } from "./app.service";
import { JwtAuthGuard } from "./modules/auth/guards/at.guard";

@Controller()
@UseGuards(JwtAuthGuard)
export class AppController {
     constructor(private appService: AppService) { }

     @Get()
     @IsPublic()
     status() {
          return 'Api Is Running!'
     }

     @Get('/global-app-data')
     async getGlobalAppData(@GetUser() user: UserEntity): Promise<GlobalAppData> {
          return this.appService.getGlobalAppData(user)
     }
}