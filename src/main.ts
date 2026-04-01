import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Response } from 'express';

async function bootstrap() {
  console.log('--- ÉTAPE 1: Initialisation Nest ---');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('--- ÉTAPE 2: AppModule chargé ---');

    // ... tes configs (CORS, Swagger, etc.)

    const port = process.env.PORT || 8080;
    console.log(`--- ÉTAPE 3: Tentative écoute sur port ${port} ---`);
    
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 App running on port ${port}`);
  } catch (error) {
    console.error('❌ CRASH AU BOOTSTRAP:', error);
    process.exit(1); // Force la sortie pour voir l'erreur dans Railway
  }
}

bootstrap();