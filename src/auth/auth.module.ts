import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  AtStrategy,
  JwtStrategy,
  RtStrategy,
} from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
