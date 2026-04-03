import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { NotificationAllQuery } from '../query/notificationAll'
import { NotificationRepository } from '../repository/notification.repository'
import { NotificationListResponseDto } from '../../categories/dto/notification.dto'

@QueryHandler(NotificationAllQuery)
export class NotificationAllHandler
  implements IQueryHandler<NotificationAllQuery>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(query: NotificationAllQuery): Promise<NotificationListResponseDto> {
    return this.notificationRepository.findAll(query)
  }
}