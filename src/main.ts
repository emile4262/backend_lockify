import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder } from "@nestjs/swagger";
async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('lockify API')
    .setDescription('API documentation for lockify application')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth
    // {
    //   type: 'http',
    //   scheme: 'bearer',
    //   bearerFormat: 'JWT',
    //   description: 'Entrez votre token JWT',
    // },
    // 'JWT-auth', // Nom qui correspond à ApiBearerAuth
    ()
    .build();

  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(app.get(JwtAuthGuard));

  app.enableCors({
    origin: '*', // Change to your frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
  app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true, 
}));
}
void bootstrap();