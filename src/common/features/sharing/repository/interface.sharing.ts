import { GenererSharingCommand } from '../command/generer-sharing'
import { RevoquerSharingCommand } from '../command/revoquer-sharing'
import { ExpirationSharingCommand } from '../command/expiration-sharing'
import { TelechargementSharingCommand } from '../command/telechargement-sharing'
import { GetSharingQuery } from '../query/get.sharing-query'
import { GetAllHistoriqueQuery } from '../query/getAll.historique-query'
import { SharingDocument } from 'src/schema/sharing.schema'
import { SharingResponseDto } from '../dto/reponse.dto'
import { SharingListResponseDto } from '../dto/SharingListResponse.dto'

export interface ISharingRepository {
  generer(cmd: GenererSharingCommand): Promise<SharingResponseDto>
  revoquer(cmd: RevoquerSharingCommand): Promise<SharingResponseDto>
  marquerExpire(cmd: ExpirationSharingCommand): Promise<void>
  enregistrerTelechargement(cmd: TelechargementSharingCommand): Promise<SharingDocument>
  getByToken(query: GetSharingQuery): Promise<SharingDocument>
  getAllHistorique(query: GetAllHistoriqueQuery): Promise<SharingListResponseDto>
}