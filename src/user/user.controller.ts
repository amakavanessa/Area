import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Express, Response } from 'express';

import { GetUser } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';

import { UserService } from './user.service';

import { User } from '@prisma/client';
import { UserUpdateDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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

  // @Patch('me')
  // updateMe(@Body() dto: UserUpdateDto) {
  //   return this.userService.updateMe(dto);
  // }

  @Post('upload-photo')
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
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is not an image',
      );
    } else {
      const response = {
        filePath: `http://localhost:3333/users/pictures/${file.filename}`,
      };
      return response;
    }
  }

  @Get('pictures/:filename')
  async getPicture(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    res.sendFile(filename, { root: './uploads' });
  }

  @Delete('me')
  deleteMe(@GetUser() user: User) {
    return this.userService.deleteMe(user.id);
  }
}
