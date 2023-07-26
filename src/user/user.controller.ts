import {
  Controller,
  Get,
  Delete,
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

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
    //user returns just email,username and type because that is what we used to create the token and getUser decorator gets user from the token
  }

  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.getOne(username);
  }

  @Get('type/:type')
  getUsersByType(@Param('type') type: string) {
    return this.userService.getUsersByType(type);
  }

  @Delete('me')
  deleteMe(@GetUser() user: User) {
    return this.userService.deleteMe(user.id);
  }
}
