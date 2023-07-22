import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';

// @UseGuards(JwtGuard)
@Controller('users')
export class HostController {
  @Get('host')
  getHost() {
    return 'hello host';
  }
}
