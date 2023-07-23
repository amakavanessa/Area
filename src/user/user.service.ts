import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOne(name: string): Promise<UserDto> {
    const user =
      await this.prisma.user.findUnique({
        where: {
          username: name,
        },
        select: {
          email: true,
          username: true,
          type: true,
          profilePicture: true,
          createdAt: true,
        },
      });
    if (!user) {
      throw new NotFoundException(
        `User does not exist`,
      );
    }

    return user;
  }
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany(
      {
        select: {
          email: true,
          username: true,
          type: true,
          profilePicture: true,
          createdAt: true,
        },
      },
    );
    if (!users) {
      throw new NotFoundException(
        `No users found`,
      );
    }
    return users;
  }
  //     async getAllUsers(): Promise<UserDto[]> {
  //     const users = await this.prisma.user.findMany(
  //       {
  //         select: {
  //           email: true,
  //           username: true,
  //           type: true,
  //           profilePicture: true,
  //           createdAt: true,
  //         },
  //       },
  //     );
  //     if (!users) {
  //       throw new NotFoundException(
  //         `No users found`,
  //       );
  //     }
  //     return users;
  //   }
}
