import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DocumentResponseDto } from '../dto/document.response.dto'
import { UploadDocumentCommand } from '../commands/upload.command'

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler
  implements ICommandHandler<UploadDocumentCommand>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(cmd: UploadDocumentCommand): Promise<DocumentResponseDto> {
    return this.documentRepository.upload(cmd)
  }
}