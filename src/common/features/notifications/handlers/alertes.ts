import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { AlertesQuery } from '../query/alertes'
import { NotificationRepository } from '../repository/notification.repository'
import { NotificationResponseDto } from '../../categories/dto/notification.dto'

@QueryHandler(AlertesQuery)
export class AlertesHandler implements IQueryHandler<AlertesQuery> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(query: AlertesQuery): Promise<NotificationResponseDto[]> {
    return this.notificationRepository.alertesExpiration(query)
  }
}