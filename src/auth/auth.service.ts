import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, AuthSigninDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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

      await this.updateRtHash(
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

    await this.updateRtHash(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }
  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async refreshTokens(
    userId: number,
    rt: string,
  ) {
    const user = await this.prisma.user.findFirst(
      {
        where: {
          id: userId,
        },
      },
    );

    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException(
        'Access Denied',
      );

    const rtMatches = await argon.verify(
      user.hashedRefreshToken!,
      rt,
    );

    if (!rtMatches)
      throw new ForbiddenException(
        'Access Denied',
      );

    const token = await this.signToken(
      user.id,
      user.email,
      user.type,
    );

    const decodedToken = this.jwt.decode(rt) as {
      sub: number;
      email: string;
      type: string;
      iat: number;
      exp: number;
    };

    if (decodedToken) {
      //check if the current date is greater than the date the refresh token would expire, if it is log out user by deleting the refresh token
      if (Date.now() > decodedToken.exp) {
        await this.logout(userId);
      }
    } else {
      console.log('Token could not be decoded.');
    }

    return token;
  }

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

  async updateRtHash(userId: number, rt: string) {
    const hash = await argon.hash(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }
}
