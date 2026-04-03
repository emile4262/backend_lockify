export class EnvoiEmailCommand {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly userId: string,
  ) {}
}