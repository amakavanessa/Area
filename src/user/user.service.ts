import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOne(name: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          username: name,
        },
      });
    return user;
  }
}
