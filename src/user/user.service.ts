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

  async getAllUsers(): Promise<{
    length: number;
    users: UserDto[];
  }> {
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

    if (!users || users.length === 0) {
      throw new NotFoundException(
        `No users found`,
      );
    }

    return { length: users.length, users };
  }
  async getUsersByType(type: string): Promise<{
    length: number;
    users: UserDto[];
  }> {
    const users = await this.prisma.user.findMany(
      {
        where: { type: type },
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
        `No ${type} found`,
      );
    }
    return { length: users.length, users };
  }

  async updateMe(dto: UserDto): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        username: dto.username,
        profilePicture: dto.profilePicture,
      },
    });
    return user;
  }

  async deleteMe(id: number): Promise<String> {
    try {
      const user = await this.prisma.user.delete({
        where: { id: id },
      });

      return `User deleted successfully!`;
    } catch (error) {
      // Handle potential errors, e.g., user not found, database connection issues, etc.
      throw new Error('Failed to delete user.');
    }
  }
}
