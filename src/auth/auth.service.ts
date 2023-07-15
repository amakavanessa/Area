import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, AuthSigninDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
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

      return this.signTToken(
        user.id,
        user.email,
        user.type,
      );
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

  async signin(dto: AuthSigninDto) {
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

    return this.signTToken(
      user.id,
      user.email,
      user.type,
    );
  }
  async signTToken(
    userId: number,
    email: string,
    type: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      type,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      { expiresIn: '15h', secret: secret },
    );
    return {
      access_token: token,
    };
  }
}
