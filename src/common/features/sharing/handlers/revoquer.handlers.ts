import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RevoquerSharingCommand } from '../command/revoquer-sharing'
import { SharingResponseDto } from '../dto/reponse.dto'
import { SharingRepository } from '../repository/sharing.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
@CommandHandler(RevoquerSharingCommand)
export class RevoquerSharingHandler
  implements ICommandHandler<RevoquerSharingCommand>
{
  constructor(
    private readonly sharingRepository: SharingRepository,
  ) {}

  async execute(cmd: RevoquerSharingCommand): Promise<SharingResponseDto> {
    const sharing = await this.sharingRepository.revoquer(cmd)
    // Note: baseUrl should be passed from controller, using empty for now
    return SharingResponseDto.fromDocument(sharing, '')
  }
}
