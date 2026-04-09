import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GenererSharingCommand } from '../command/generer-sharing'
import { SharingRepository } from '../repository/sharing.repository'
import { SharingDocument } from 'src/schema/sharing.schema'
import { Injectable } from '@nestjs/common'

@Injectable()
@CommandHandler(GenererSharingCommand)
export class GenererSharingHandler
  implements ICommandHandler<GenererSharingCommand>
{
  constructor(
    private readonly sharingRepository: SharingRepository) {}

  async execute(cmd: GenererSharingCommand): Promise<SharingDocument> {
    return this.sharingRepository.generer(cmd)
  }
}