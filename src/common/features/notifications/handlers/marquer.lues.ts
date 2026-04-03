import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { MarquerLueCommand } from '../commands/marquer.lues'
import { NotificationRepository } from '../repository/notification.repository'
import { NotificationResponseDto } from '../../categories/dto/notification.dto'

@CommandHandler(MarquerLueCommand)
export class MarquerLueHandler implements ICommandHandler<MarquerLueCommand> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(cmd: MarquerLueCommand): Promise<NotificationResponseDto> {
    return this.notificationRepository.marquerLue(cmd)
  }
}