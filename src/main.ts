import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Polyfill for crypto if not available
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // HABILITAR CORS
  app.enableCors({
    origin: [
      'http://localhost:8081',
      'http://172.20.10.2:3000',
      'http://172.20.10.4:3000',
      'http://172.20.10.2:*',
      'http://172.20.10.4:*',
      'exp://172.20.10.2:*',
      'exp://172.20.10.4:*',
      'http://localhost:*',
      'exp://localhost:*',
      '*' // Temporal para debugging - remover en producción
    ], // Permitir conexiones desde la app móvil
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true, // si usas cookies o Authorization headers
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api/v1'
  );

  app.setGlobalPrefix('api/v1'
  );

  const config = new DocumentBuilder()
    .setTitle('DAPP RE API')
    .setDescription('DAPP Payment Rents applications')
    .setVersion('1.0')
    .addTag('URL')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
