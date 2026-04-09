import { SharingPermission, SharingStatus } from "src/schema/sharing.schema";
import { HistoriqueAccesDto } from "./historique.dto";
import { SharingResponseDto } from "./reponse.dto";

export class SharingAvecHistoriqueDto extends SharingResponseDto {
  constructor(
    id: string,
    usersId: string,
    documentId: string,
    lienPartage: string,
    permission: SharingPermission,
    status: SharingStatus,
    expiresAt: string,
    accessCount: number,
    createdAt: string,
    public readonly accessHistory: HistoriqueAccesDto[],
  ) {
    super(id, usersId, documentId, lienPartage, permission, status, expiresAt, accessCount, createdAt)
  }
}