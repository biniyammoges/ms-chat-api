import { Controller, Get, } from "@nestjs/common";
import { IsPublic } from "./shared/public.decorator";

@Controller()
export class AppController {
     @Get()
     @IsPublic()
     status() {
          return 'Api Is Running!'
     }
}