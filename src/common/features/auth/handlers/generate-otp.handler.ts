import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GenerateOtpCommand } from '../commands/generate-otp.command';
import { AUTH_REPOSITORY, IAuthRepository } from '../repository/auth-interface.repository';
import { MailService } from 'src/common/mail/mail.module';

@CommandHandler(GenerateOtpCommand)
export class GenerateOtpHandler implements ICommandHandler<GenerateOtpCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: GenerateOtpCommand): Promise<{ message: string; expiresIn: number }> {
    const { email } = command;

    // Déléguer toute la logique métier au repository
    return await this.authRepository.generateAndSendOtp(email, this.mailService);
  }
}