import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
//amodule is a class anotated to a module decorator
@Module({
  imports: [AuthModule, UserModule, BookmarkModule],
})
export class AppModule {}
