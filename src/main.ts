import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initalizeWsAdapter } from './init-ws-adapter';
import { initalizeRedisSubscriber } from './initialize-redis-ps';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('main')
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api')

  app.enableCors()

  // Initialize new socket adaptor 
  initalizeWsAdapter(app);
  initalizeRedisSubscriber(app)

  const config = new DocumentBuilder()
    .setTitle('ms-chat api')
    .setDescription('ms-chat api documentation')
    .setVersion('1.0.0')
    .addTag('ms-chat')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('/explorer', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 5000
  await app.listen(port);
  logger.log(`Server started on port ${port}`)
}

bootstrap();
