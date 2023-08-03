import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto, UserUpdateDto } from './dto';
import { diskStorage } from 'multer';

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

  async updateMe(
    id: number,
    dto: UserUpdateDto,
  ): Promise<UserDto> {
    const updatedUser =
      await this.prisma.user.update({
        data: dto,
        where: {
          id,
        },
      });
    return updatedUser;
  }

  //this function would just be used by the admin
  async updateUser(
    id: number,
    dto: UserUpdateDto,
  ): Promise<UserDto> {
    const updatedUser =
      await this.prisma.user.update({
        data: dto,
        where: {
          id,
        },
      });
    return updatedUser;
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

  //this function would just be used by the admin
  async deleteUser(id: number): Promise<String> {
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
