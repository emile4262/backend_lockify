export class GetUserQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,

  ) {}
}