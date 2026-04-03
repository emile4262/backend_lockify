import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { NombreNonLueQuery } from '../query/nombre.non.lue'
import { NotificationRepository } from '../repository/notification.repository'

@QueryHandler(NombreNonLueQuery)
export class NombreNonLuesHandler implements IQueryHandler<NombreNonLueQuery> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(query: NombreNonLueQuery): Promise<{ count: number }> {
    return this.notificationRepository.nombreNonLues(query)
  }
}