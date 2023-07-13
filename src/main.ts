import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //you have to include this to make all modules use the pipe and validator class

  app.useGlobalPipes(
    new ValidationPipe({
      //this trims out the fields that are not in the dto
      whitelist: true,
    }),
  );
  await app.listen(3333);
}
bootstrap();
