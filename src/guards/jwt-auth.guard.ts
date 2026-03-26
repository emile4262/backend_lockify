// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from './current-user.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // Laisser passer les routes marquées @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }

  // handleRequest(err: any, user: any) {
  //   if (err) throw new UnauthorizedException('TOKEN_INVALID_OR_EXPIRED')
  //   if (!user) throw new UnauthorizedException('TOKEN_INVALID_OR_EXPIRED')
  //   return user
  // }
}

