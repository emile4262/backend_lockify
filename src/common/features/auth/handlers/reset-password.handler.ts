import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { AUTH_REPOSITORY, IAuthRepository } from '../repository/auth-interface.repository';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ message: string }> {
    const { email, lastPassword, newPassword } = command;

    // Déléguer toute la logique métier au repository
    return await this.authRepository.resetPasswordWithToken(email, lastPassword, newPassword);
  }
}
