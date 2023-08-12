import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { AuthDto, AuthSigninDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Tokens } from './types';
import { GetUser } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  //not advisable to use libraries that are framework specific in the service layer so your code can be resusable whhen you change frameworks
  signup(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signup(dto);

    //pipes are functions that transform data
  }
  @Post('signin')
  signin(@Body() dto: AuthSigninDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser() user: User) {
    return this.authService.logout(user.id);
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@GetUser() user: User) {
    return this.authService.refreshTokens(
      user['id'],
      user.rt,
    );
  }
}
