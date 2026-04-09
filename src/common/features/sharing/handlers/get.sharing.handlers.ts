import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetSharingQuery } from '../query/get.sharing-query'
import { SharingDocument } from 'src/schema/sharing.schema'
import { SharingRepository } from '../repository/sharing.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
@QueryHandler(GetSharingQuery)
export class GetSharingHandler implements IQueryHandler<GetSharingQuery> {
  constructor(
  private readonly sharingRepository: SharingRepository) {}

  async execute(query: GetSharingQuery): Promise<SharingDocument> {
    return this.sharingRepository.getByToken(query)
  }
}