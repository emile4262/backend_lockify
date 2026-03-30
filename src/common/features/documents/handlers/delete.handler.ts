import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DeleteDocumentCommand } from '../commands/delete.command'
import { DocumentResponseDto } from '../dto/document.response.dto'

@CommandHandler(DeleteDocumentCommand)
export class DeleteDocumentHandler
  implements ICommandHandler<DeleteDocumentCommand>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(command: DeleteDocumentCommand): Promise<DocumentResponseDto> {
    return this.documentRepository.deleteDocument(command.documentId);
  }
}