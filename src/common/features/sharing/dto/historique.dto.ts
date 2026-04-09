export class HistoriqueAccesDto {
  constructor(
    public readonly accessedAt: string,
    public readonly ip: string,
  ) {}
}