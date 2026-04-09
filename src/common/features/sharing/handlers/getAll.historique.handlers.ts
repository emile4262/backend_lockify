import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Injectable } from '@nestjs/common'
import { GetAllHistoriqueQuery } from '../query/getAll.historique-query'
import { SharingListResponseDto } from '../dto/SharingListResponse.dto'
import { SharingRepository } from '../repository/sharing.repository'
import { PaginationsDto } from '../../users/dto/pagination.dto'
import { HistoriqueAccesDto } from '../dto/historique.dto'
import { SharingAvecHistoriqueDto } from '../dto/sharing-historique.dto'
import { SharingResponseDto } from '../dto/reponse.dto'

@Injectable()
@QueryHandler(GetAllHistoriqueQuery)
export class GetAllHistoriqueHandler
  implements IQueryHandler<GetAllHistoriqueQuery>
{
  constructor(private readonly sharingRepository: SharingRepository) {}

  async execute(query: GetAllHistoriqueQuery): Promise<SharingListResponseDto> {
    const paginationDto: PaginationsDto = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      dateCreationDebut: query.dateCreationDebut,
      dateCreationFin: query.dateCreationFin,
    }
    
    const paginationResult = await this.sharingRepository.getAllHistorique(query.usersId, paginationDto)
    
    const items = paginationResult.result.map((item) => {
      const history = (item.accessHistory ?? []).map(
        (h) =>
          new HistoriqueAccesDto(
            new Date(h.accessedAt).toISOString(),
            h.ip,
          ),
      )
      return new SharingAvecHistoriqueDto(
        item._id.toString(),
        item.usersId.toString(),
        item.documentId.toString(),
        `${process.env.POINT_API ?? 'http://localhost:5001/api'}/sharing/${item._id}`,
        item.permission,
        item.status,
        new Date(item.expiresAt).toISOString(),
        item.accessCount ?? 0,
        item.createdAt instanceof Date
          ? item.createdAt.toISOString()
          : item.createdAt,
        history,
      )
    })
    
    return new SharingListResponseDto(
      items,
      paginationResult.meta.itemCount,
      paginationResult.meta.page,
      paginationResult.meta.limit,
    )
  }
}