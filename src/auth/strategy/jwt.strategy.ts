import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  ExtractJwt,
} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  //   async validate(payload: JwtPayload) {
  //     const user = await this.prisma.user.findUnique({
  //       where: {
  //         id: payload.id,
  //       },
  //     });

  //     if (!user) {
  //       throw new UnauthorizedException();
  //     }

  //     return user;
  //   }
}
