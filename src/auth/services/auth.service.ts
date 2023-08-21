import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  AuthDto,
  AuthSigninDto,
  PasswordResetDto,
  decodedToken,
} from '../dto';

import * as argon from 'argon2';

import * as crypto from 'crypto';

import { Prisma } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import { Tokens } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /************** SIGN UP ******************/
  async signup(dto: AuthDto): Promise<Tokens> {
    //generate a hash password
    const hash = await argon.hash(dto.password);

    //save the user in the database
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          hash,
          type: dto.type,
        },
      });

      const tokens = await this.getToken(
        user.id,
        user.email,
        user.type,
      );

      await this.createRtHash(
        user.id,
        tokens.refresh_token,
      );
      return tokens;
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials already exist',
          );
        }
      }
      throw error;
    }
  }
  /************** END OF SIGN UP ******************/

  /************** SIGN IN ******************/
  async signin(
    dto: AuthSigninDto,
  ): Promise<Tokens> {
    //find user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    //if user does not exist throw error
    if (!user) {
      throw new ForbiddenException(
        'Invalid credentials',
      );
    }

    //compare password with hash
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    //if password does not match throw error
    if (!pwMatches) {
      throw new ForbiddenException(
        'Invalid credentials',
      );
    }

    const tokens = await this.getToken(
      user.id,
      user.email,
      user.type,
    );

    await this.createRtHash(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }
  /************** END OF SIGN IN ******************/

  /************** LOG OUT ******************/
  async logout(userId: number, rT: string) {
    const parts = rT.split(' ');
    const rt_token = parts[1];
    const nouser =
      await this.prisma.rT.deleteMany({
        where: {
          userId: userId,
          hashedRefreshToken: rt_token,
        },
      });
    if (!nouser)
      return 'Problem logging out user';

    return 'User logged out successfully';
  }

  /************** END OF LOG OUT ******************/

  /************** REFRESH ******************/
  // async refreshTokens(
  //   userId: number,
  //   rt: string,
  // ) {
  //   const user = await this.prisma.user.findFirst(
  //     {
  //       where: {
  //         id: userId,
  //       },
  //     },
  //   );

  //   if (!user || !user.hashedRefreshToken)
  //     throw new ForbiddenException(
  //       'Access Denied heyyy',
  //     );

  //   const rtMatches = await argon.verify(
  //     user.hashedRefreshToken,
  //     rt,
  //   );
  //   if (!rtMatches)
  //     throw new ForbiddenException(
  //       'Access Denied ooo',
  //     );

  //   const token = await this.signToken(
  //     user.id,
  //     user.email,
  //     user.type,
  //   );

  //   const decodedToken: decodedToken =
  //     this.jwt.decode(rt) as {
  //       sub: number;
  //       email: string;
  //       type: string;
  //       iat: number;
  //       exp: number;
  //     };

  //   if (decodedToken) {
  //     //check if the current date is greater than the date the refresh token would expire, if it is log out user by deleting the refresh token
  //     if (Date.now() > decodedToken.exp * 1000) {
  //       await this.logout(userId);
  //     }
  //   } else {
  //     console.log('Token could not be decoded.');
  //   }

  //   return token;
  // }
  /************** END OF REFRESH ******************/

  /************** SIGN TOKEN ******************/
  async signToken(
    userId: number,
    email: string,
    type: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = {
      sub: userId,
      email,
      type,
    };

    const secret = this.config.get('AT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      { expiresIn: 60 * 15, secret: secret },
    );
    return {
      access_token: token,
    };
  }
  /************** END OF SIGN TOKEN ******************/

  /************** GET TOKEN ******************/
  async getToken(
    userId: number,
    email: string,
    type: string,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      email,
      type,
    };

    const ATSecret = this.config.get('AT_SECRET');
    const RTSecret = this.config.get('RT_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: 60 * 15,
        secret: ATSecret,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7,
        secret: RTSecret,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
  /************** END OF GET TOKEN ******************/

  /************ UPDATE REFRESH TOKEN HASH ON THE DB ***************/
  async updateRtHash(userId: number, rt: string) {
    const hash = await argon.hash(rt);
    await this.prisma.rT.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }

  async createRtHash(userId: number, rt: string) {
    const token = await this.prisma.rT.create({
      data: {
        hashedRefreshToken: rt,
        userId,
      },
    });
  }
  /************** END OF UPDATE RT HASH ******************/

  /************ GENERATE RESET TOKEN FOR PASSWORD CHANGE **********/
  async getResetToken(email: string): Promise<{
    resetToken: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
  }> {
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);
    const passwordResetExpires = new Date();
    passwordResetExpires.setMinutes(
      passwordResetExpires.getMinutes() + 10,
    );

    const resetCreds =
      await this.prisma.user.update({
        where: { email: email },
        data: {
          passwordResetToken: passwordResetToken,
          passwordResetExpires:
            passwordResetExpires,
        },
      });

    if (!resetCreds) {
      throw new BadRequestException(
        `Token could not be sent to ${email}`,
      );
    }
    return {
      resetToken,
      passwordResetToken,
      passwordResetExpires,
    };
  }
  /************** END OF GET RESET TOKEN ******************/

  /************** RESET PASSWORD ******************/
  // async resetPassword(
  //   token: string,
  //   dto: PasswordResetDto,
  // ) {
  //   if (dto.password !== dto.passwordConfirm) {
  //     throw new BadRequestException(
  //       'Passwords do not match',
  //     );
  //   }
  //   const user = await this.prisma.user.findFirst(
  //     {
  //       where: {
  //         passwordResetToken: token,
  //         passwordResetExpires: {
  //           gte: new Date(),
  //         },
  //       },
  //     },
  //   );

  //   if (!user) {
  //     throw new BadRequestException(
  //       'Token is invalid or has expired',
  //     );
  //   }

  //   const hash = await argon.hash(dto.password);
  //   const updatedUser =
  //     await this.prisma.user.update({
  //       where: { email: user.email },
  //       data: {
  //         hash: hash,
  //         passwordChangedAt: new Date(),
  //         passwordResetToken: null,
  //         passwordResetExpires: null,
  //       },
  //     });

  //   if (!updatedUser) {
  //     throw new BadRequestException(
  //       'Password could not be updated',
  //     );
  //   }

  //   // if (
  //   //   user.hashedRefreshToken &&
  //   //   updatedUser.passwordChangedAt
  //   // ) {
  //   //   const decodedToken = this.jwt.decode(
  //   //     user.hashedRefreshToken,
  //   //   ) as {
  //   //     sub: number;
  //   //     email: string;
  //   //     type: string;
  //   //     iat: number;
  //   //     exp: number;
  //   //   };
  //     // const passwordChangedAt =
  //     //   updatedUser.passwordChangedAt.getTime();
  //     // if (decodedToken.iat < passwordChangedAt) {
  //     //   await this.logout(decodedToken.sub);
  //     // }
  //     console.log(decodedToken);
  //   }

  //   // console.log(dec);

  //   return 'Password updated successfully!';
  // }

  /************** END OF RESET PASSWORD ******************/
}
