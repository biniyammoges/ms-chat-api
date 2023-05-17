import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { UserEntity } from "src/modules/user/entities/user.entity";

export const GetUser = createParamDecorator((key: keyof UserEntity, ctx: ExecutionContext) => {
     const req = ctx.switchToHttp().getRequest()
     const user = req.user as UserEntity

     return key ? user[key] : user
})