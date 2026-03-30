import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DocumentRepository } from '../repository/document.repository'
import { DeleteDocumentCommand } from '../commands/delete.command'

@CommandHandler(DeleteDocumentCommand)
export class DeleteDocumentHandler
  implements ICommandHandler<DeleteDocumentCommand>
{
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(cmd: DeleteDocumentCommand): Promise<{ deleted: boolean }> {
    return this.documentRepository.delete(cmd)
  }
}