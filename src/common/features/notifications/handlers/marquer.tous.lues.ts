import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { MarquerTousLuesCommand } from '../commands/marquer.tous.lues'
import { NotificationRepository } from '../repository/notification.repository'

@CommandHandler(MarquerTousLuesCommand)
export class MarquerTousLuesHandler
  implements ICommandHandler<MarquerTousLuesCommand>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(cmd: MarquerTousLuesCommand): Promise<{ updated: number }> {
    return this.notificationRepository.marquerToutesLues(cmd)
  }
}