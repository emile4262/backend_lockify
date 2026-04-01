import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Response } from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Static files
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

    // CORS
    app.enableCors({
      origin: '*',
    });

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .addTag('api')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Route test (IMPORTANT pour Railway)
    app.getHttpAdapter().get('/', (req, res: Response) => {
  res.send('API RUNNING 🚀');
  }); 

    const port = process.env.PORT || 3000;

    await app.listen(port, '0.0.0.0');

    console.log(`🚀 App running on port ${port}`);
  } catch (error) {
    console.error('❌ BOOT ERROR:', error);
  }
}

bootstrap();