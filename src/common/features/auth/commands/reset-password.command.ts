export class ResetPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly lastPassword: string,
    public readonly newPassword: string,
  ) {}
}