import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DocumentResponseDto } from '../dto/document.response.dto'
import { UpdateDocumentCommand } from '../commands/update.command'

@CommandHandler(UpdateDocumentCommand)
export class UpdateDocumentHandler
  implements ICommandHandler<UpdateDocumentCommand>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(cmd: UpdateDocumentCommand): Promise<DocumentResponseDto> {
    return this.documentRepository.update(cmd)
  }
}