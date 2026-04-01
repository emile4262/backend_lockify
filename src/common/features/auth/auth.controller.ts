// auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards, Ip, Req, UnauthorizedException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { LoginUserCommand }    from './commands/login-user.command'
import { LoginRequestDto }     from './dto/login.request.dto'
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import {  Public }  from '../../../guards/public.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // @Post('register')
  // @Public()                       
  // register(@Body() dto: RegisterRequestDto) {
  //   return this.commandBus.execute(
  //     new RegisterUserCommand(dto.email, dto.password)
  //   )
  // }

   @Post('/login')
  @Public()
  @ApiOperation({ summary: "Authentification de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Authentification réussie.' })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 406,
    description: 'Utilisateur supprimé.',
  })
  @ApiResponse({
    status: 407,
    description: 'Utilisateur désactivé.',
  })
  //Compte verrouillé après 3 tentatives
  @ApiResponse({
    status: 405,
    description: 'Compte verrouillé après 3 tentatives.',
  })

  //Utilisateur supprimé
  @ApiResponse({ status: 406, description: 'Utilisateur supprimé.' })
  //Utilisateur désactivé
  @ApiResponse({ status: 407, description: 'Utilisateur désactivé.' })
  //Mot de passe doit etre changé
  @ApiResponse({
    status: 408,
    description: 'Mot de passe doit etre changé.',
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe invalide.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  @ApiResponse({
    status: 409,
    description: 'Votre mot de passe a expiré, veuillez le changer.',
  })
  @ApiResponse({
    status: 412,
    description: 'Une session est déjà active sur un autre appareil.',
  })
  async login(
    @Body() CreateAuthDto: LoginRequestDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const user = await this.commandBus.execute(new LoginUserCommand(CreateAuthDto.email, CreateAuthDto.password));
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    return { user };
  }

  // @Get('me')                      
  // getProfile(@CurrentUser() user: { userId: string }) {
  //   return this.queryBus.execute(
  //     new GetUserProfileQuery(user.userId)
  //   )
  // }
}