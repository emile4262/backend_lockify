import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TelechargementSharingCommand } from '../command/telechargement-sharing'
import { SharingRepository } from '../repository/sharing.repository'
import { SharingDocument } from 'src/schema/sharing.schema'
import { Injectable } from '@nestjs/common'

@Injectable()
@CommandHandler(TelechargementSharingCommand)
export class TelechargementSharingHandler
  implements ICommandHandler<TelechargementSharingCommand>
{
  constructor(
    private readonly sharingRepository: SharingRepository,
  ) {}

  async execute(cmd: TelechargementSharingCommand): Promise<SharingDocument> {
    return this.sharingRepository.enregistrerTelechargement(cmd)
  }
}