import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UserDto,
  UserUpdateDto,
  PasswordResetDto,
} from './dto';
import * as argon from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //CRUD OPERATIONS
  async getMe(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findFirst(
      {
        where: {
          id: id,
        },
        select: {
          email: true,
          username: true,
          type: true,
          profilePicture: true,
          createdAt: true,
        },
      },
    );
    if (!user) {
      throw new NotFoundException(
        `User does not exist`,
      );
    }

    return user;
  }

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
          passwordChangedAt: new Date(),
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

  async resetPassword(
    token: string,
    dto: PasswordResetDto,
  ) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException(
        'Passwords do not match',
      );
    }
    const user = await this.prisma.user.findFirst(
      {
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gte: new Date(),
          },
        },
      },
    );

    if (!user) {
      throw new BadRequestException(
        'Token is invalid or has expired',
      );
    }

    const hash = await argon.hash(dto.password);
    const updatedUser =
      await this.prisma.user.update({
        where: { email: user.email },
        data: {
          hash: hash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

    if (!updatedUser) {
      throw new BadRequestException(
        'Password could not be updated',
      );
    }

    return 'Password updated successfully!';
  }
}
