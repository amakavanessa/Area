import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  AtStrategy,
  JwtStrategy,
  RtStrategy,
} from './strategy';
import { RefreshScheduleService } from './services/refresh-schedule.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshScheduleService,
    JwtStrategy,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
