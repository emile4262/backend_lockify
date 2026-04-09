export class GetUsersQuery {
  constructor(
    public readonly page?: string,
    public readonly limit?: string,
    public readonly search?: string,
    public readonly dateCreationDebut?: string,
    public readonly dateCreationFin?: string,
  ) {}
}
