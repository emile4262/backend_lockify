import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ExpirationSharingCommand } from '../command/expiration-sharing'
import { SharingRepository } from '../repository/sharing.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
@CommandHandler(ExpirationSharingCommand)
export class ExpirationSharingHandler
  implements ICommandHandler<ExpirationSharingCommand>
{
  constructor(
    private readonly sharingRepository: SharingRepository) {}

  async execute(cmd: ExpirationSharingCommand): Promise<void> {
    return this.sharingRepository.marquerExpire(cmd)
  }
}