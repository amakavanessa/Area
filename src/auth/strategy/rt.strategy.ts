import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

//use @injectable when you want to use it as a provider
@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('RT_SECRET'),
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: any) {
    const refreshToken = req
      .get('authorization')
      ?.replace('Bearer', '')
      .trim();
    return { ...payload, refreshToken };

    //it does this req.user = payload
  }
}
