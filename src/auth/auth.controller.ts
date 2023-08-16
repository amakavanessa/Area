import {
  Body,
  Controller,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';

import { User } from '@prisma/client';

import { Request, Response } from 'express';

import { AuthService } from './services/auth.service';
import {
  AuthDto,
  AuthSigninDto,
  PasswordResetDto,
  decodedToken,
} from './dto';
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
  logout() {
    // Clear the access_token cookie by setting it to an expired date
    // res.clearCookie('access_token');

    // Optionally, clear other cookies like refresh_token

    // Return a response indicating successful logout
    return 'Logout successful';
  }

  // @Public()
  // @UseGuards(RtGuard)
  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // refreshTokens(
  //   @GetUser() user: decodedToken,
  //   @GetUser('refreshToken') refreshToken: string,
  // ) {
  //   return this.authService.refreshTokens(
  //     user.sub,
  //     refreshToken,
  //   );
  // }

  @Patch('password/send-reset-token')
  async generateResetToken(
    @GetUser() user: decodedToken,
  ) {
    return this.authService.getResetToken(
      user.email,
    );
  }

  // @Patch('reset-password/:token')
  // async resetPassword(
  //   @Param('token') token: string,
  //   @Body() dto: PasswordResetDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.authService.resetPassword(
  //     token,
  //     dto,
  //   );
  // }
}
