import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

type JwtPayload = {
  sub: string;
  email: string;
};

//use @injectable when you want to use it as a provider
@Injectable()
export class AtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('AT_SECRET'),
    });
  }
  validate(payload: JwtPayload) {
    return payload;

    //it does this req.user = payload
  }
}
