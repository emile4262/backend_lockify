
import { SharingResponseDto } from "./reponse.dto";

export class SharingListResponseDto {
  constructor(
    public readonly items: SharingResponseDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly pageSize: number,
  ) {}
}