import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    //generate a hash password
    const hash = await argon.hash(dto.password);

    //save the user in the database
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        hash,
        type: dto.type,
      },
    });

    return user;
  }

  signin() {
    return { msg: 'Hello, i ve signed in' };
  }
}
