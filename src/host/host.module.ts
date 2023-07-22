import { Module } from '@nestjs/common';
import { HostController } from './host.controller';

@Module({
  controllers: [HostController],
})
export class HostModule {}
