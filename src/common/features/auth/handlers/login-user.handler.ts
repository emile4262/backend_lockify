import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginUserCommand } from '../commands/login-user.command';
import { AUTH_REPOSITORY, IAuthRepository } from '../repository/auth-interface.repository';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<any> {
    const { email, password } = command;

    // Déléguer toute la logique métier au repository
    return await this.authRepository.authenticateUser(email, password);
  }
}
