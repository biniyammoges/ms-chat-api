import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../../../shared/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
     constructor(private reflector: Reflector) { super() }

     async canActivate(context: ExecutionContext): Promise<any> {
          const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,
               [
                    context.getHandler(),
                    context.getClass(),
               ])

          if (isPublic) {
               try {
                    await super.canActivate(context);
               } catch { }
               return true;
          }

          return super.canActivate(context)
     }
}
