import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { initalizeWsAdapter } from './init-ws-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api')

  // Initialize new socket adaptor 
  initalizeWsAdapter(app);

  const port = process.env.PORT || 3000
  await app.listen(port);
}
bootstrap();
