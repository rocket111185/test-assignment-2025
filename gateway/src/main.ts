import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fix to accept larger request bodies
  app.use(bodyParser.json({ limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
