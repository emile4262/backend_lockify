export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly nom?: string,
    public readonly prenom?: string,
    public readonly email?: string,
    public readonly password?: string,
  ) {}
}