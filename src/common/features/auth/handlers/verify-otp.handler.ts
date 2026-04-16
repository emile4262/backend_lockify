// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Inject } from '@nestjs/common';
// import { VerifyOtpCommand } from '../commands/verify-otp.command';
// import { AUTH_REPOSITORY, IAuthRepository } from '../repository/auth-interface.repository';

// @CommandHandler(VerifyOtpCommand)
// export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
//   constructor(
//     @Inject(AUTH_REPOSITORY)
//     private readonly authRepository: IAuthRepository,
//   ) {}

//   async execute(command: VerifyOtpCommand): Promise<{ resetToken: string }> {
//     const { email, otp } = command;

//     // Déléguer toute la logique métier au repository
//     return await this.authRepository.verifyOtpAndGenerateResetToken(email, otp);
//   }
// }
