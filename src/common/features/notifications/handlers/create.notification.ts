import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateNotificationCommand } from '../commands/create.notification'
import { NotificationRepository } from '../repository/notification.repository'
import { NotificationResponseDto } from '../../categories/dto/notification.dto'

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler
  implements ICommandHandler<CreateNotificationCommand>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(cmd: CreateNotificationCommand): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.create(cmd)
    return NotificationResponseDto.fromDocument(notification)
  }
}