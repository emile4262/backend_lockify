export class GetSharingQuery {
  constructor(
    public readonly id: string,
    public readonly ip?: string,
  ) {}
}