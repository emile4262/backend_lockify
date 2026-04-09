export class GetAllHistoriqueQuery {
  constructor(
    public readonly usersId: string,
    public readonly page?: string,
    public readonly limit?: string,
    public readonly search?: string,
    public readonly dateCreationDebut?: string,
    public readonly dateCreationFin?: string,
  ) {}
}
