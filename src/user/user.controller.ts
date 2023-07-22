import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { GetUser } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';

import { UserService } from './user.service';

import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.getOne(username);
  }
}
