import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('--- ÉTAPE 1: Initialisation Nest ---');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('--- ÉTAPE 2: AppModule chargé ---');

    //Préfixe Global : Toutes tes routes seront sous /api (ex: /api/users/All)
    app.setGlobalPrefix('api');

    // Fichiers statiques (Uploads)
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

    //Configuration CORS (pour autoriser ton frontend)
    app.enableCors({
      origin: '*',
    });

    // Configuration SWAGGER
    const config = new DocumentBuilder()
      .setTitle('Lockify API')
      .setDescription('Documentation de l’API backend sur Railway')
      .setVersion('1.0')
      .addTag('api')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Le premier argument 'api' est le chemin de la doc. 
    // Avec le global prefix, Swagger sera sur : /api
    SwaggerModule.setup('api', app, document);

    //Gestion du Port pour Railway
    const port = process.env.PORT || 8080;
    console.log(`--- ÉTAPE 3: Tentative écoute sur port ${port} ---`);
    
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 Serveur prêt !`);
    console.log(`📜 Swagger disponible sur : /api`);
    
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE AU DÉMARRAGE :', error);
    process.exit(1);
  }
}

bootstrap();