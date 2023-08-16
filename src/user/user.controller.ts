import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Express, Response } from 'express';

import { GetUser } from '../auth/decorator';

import { UserService } from './user.service';

import { UserUpdateDto } from './dto';
import { decodedToken } from 'src/auth/dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  async getMe(@GetUser() user: decodedToken) {
    // return user;
    return this.userService.getMe(user.sub);

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

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', //destination folder
        filename: (req, file, cb) => {
          const name =
            file.originalname.split('.')[0];
          const fileExt =
            file.originalname.split('.')[1];
          const newFileName =
            name.split(' ').join('_') +
            '_' +
            Date.now() +
            '.' +
            fileExt;

          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|gif)$/,
          )
        ) {
          return cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  async updateMe(
    @Body() dto: UserUpdateDto,
    @GetUser() user: decodedToken,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.profilePicture = `/pictures/${file.filename}`;
    }

    return this.userService.updateMe(
      user.sub,
      dto,
    );
  }

  @Get('pictures/:filename')
  async getPicture(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    res.sendFile(filename, { root: './uploads' });
  }

  @Delete('me')
  deleteMe(@GetUser() user: decodedToken) {
    return this.userService.deleteMe(user.sub);
  }
}
