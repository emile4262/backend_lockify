export class RevoquerSharingCommand {
  constructor(
    public readonly sharingId: string,
    public readonly usersId: string,
  ) {}
}