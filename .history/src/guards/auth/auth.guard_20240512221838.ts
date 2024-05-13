import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtPayLoad } from 'src/interfaces/jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(private jwtService: JwtService,

  ) {}

async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
   
   const request = context.switchToHttp().getRequest();
   const token = this.extractTokenFromHeader(request);
   
   if (!token) {
    throw new UnauthorizedException('There is no bearer token');
  }
  try {
    const payload = await this.jwtService.verifyAsync<JwtPayLoad>(
      token,
      {
        secret: jwtConstants.secret
      }
    );
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    request['user'] = payload;


  } catch (error) {
    throw new UnauthorizedException();

  }

   console.log({ token });
   
   
    return Promise.resolve(true);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
