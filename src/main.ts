import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
const result = dotenv.config();
console.log(' DOTENV CONFIG RESULT:', result.error ? 'ERROR' : 'SUCCESS');
console.log(' EMAIL_USER:', process.env.EMAIL_USER);
console.log(' EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'UNDEFINED');

async function bootstrap() {
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
      .setTitle('api')
      .setDescription('Documentation de l’API backend sur Railway')
      .setVersion('1.0')
      .addTag('api')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Le premier argument 'api' est le chemin de la doc. 
    SwaggerModule.setup('api', app, document);

    //Gestion du Port pour Railway
    const port = process.env.PORT || 5001;    
    await app.listen(port, '0.0.0.0');
    
  } catch (error) {
    process.exit(1);
  }
}
bootstrap();