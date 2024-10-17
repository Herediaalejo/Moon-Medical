import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  // Configurar CORS
  app.use(
    cors({
      origin: 'http://localhost:5173', // Reemplaza con el dominio y puerto de tu aplicación Vite
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
