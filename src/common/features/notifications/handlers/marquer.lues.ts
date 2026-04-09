import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { MarquerLueCommand } from '../commands/marquer.lues'
import { NotificationRepository } from '../repository/notification.repository'

@CommandHandler(MarquerLueCommand)
export class MarquerLueHandler implements ICommandHandler<MarquerLueCommand> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(cmd: MarquerLueCommand): Promise<{ message: string }> {
    return this.notificationRepository.marquerCommeLue(cmd.notificationId, cmd.userId)
  }
}