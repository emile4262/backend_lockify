import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs'
import { GenerateOtpCommand } from './commands/generate-otp.command';
import { VerifyOtpCommand } from './commands/verify-otp.command';
import { ResetPasswordCommand } from './commands/reset-password.command';
import { LoginUserCommand } from './commands/login-user.command';
import { LoginRequestDto, RequestOtpDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.response.dto';
import { Public } from 'src/guards/public.decorator';
import { ApiProperty } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiProperty({description: 'Connexion d\'un utilisateur'})
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto) {
    return this.commandBus.execute(new LoginUserCommand(dto.email, dto.password));
  }

  @Post('forgot-password')
  @Public()
  @ApiProperty({description: 'Demande de réinitialisation de mot de passe'})
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: RequestOtpDto) {
    return this.commandBus.execute(new GenerateOtpCommand(dto.email));
  }

  @Post('verify-otp')
  @Public()
  @ApiProperty({description: 'Vérification du code OTP'})
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.commandBus.execute(new VerifyOtpCommand(dto.email, dto.otp));
  }

  @Post('reset-password')
  @Public()
  @ApiProperty({description: 'Réinitialisation du mot de passe'})
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.commandBus.execute(
      new ResetPasswordCommand(dto.email, dto.lastPassword, dto.newPassword),
    );
  }
}