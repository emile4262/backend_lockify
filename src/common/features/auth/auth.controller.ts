// auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { LoginUserCommand }    from './commands/login-user.command'
import { LoginRequestDto }     from './dto/login.request.dto'
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import {  Public }  from '../../../guards/current-user.decorator'

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

  @Post('login')
  @Public()
  @ApiProperty({ description: 'connexion'})
  login(@Body() dto: LoginRequestDto) {
    return this.commandBus.execute(
      new LoginUserCommand(dto.email, dto.password)
    )
  }

  // @Get('me')                      
  // getProfile(@CurrentUser() user: { userId: string }) {
  //   return this.queryBus.execute(
  //     new GetUserProfileQuery(user.userId)
  //   )
  // }
}