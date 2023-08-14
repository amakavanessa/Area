import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { AuthDto, AuthSigninDto } from './dto';
import { RtGuard } from './guard';
import { Tokens } from './types';
import { GetUser, Public } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  //not advisable to use libraries that are framework specific in the service layer so your code can be resusable whhen you change frameworks
  signup(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signup(dto);

    //pipes are functions that transform data
  }

  @Public()
  @Post('signin')
  signin(@Body() dto: AuthSigninDto) {
    return this.authService.signin(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetUser() user: User,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(
      user.id,
      refreshToken,
    );
  }
}
