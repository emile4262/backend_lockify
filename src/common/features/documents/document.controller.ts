import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { DocumentCategory } from 'src/common/schema/documents.schema'
import { CurrentUser } from 'src/guards/current-user.decorator'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'

import { v4 as uuid } from 'uuid'
import { DeleteDocumentCommand } from './commands/delete.command'
import { UpdateDocumentCommand } from './commands/update.command'
import { UploadDocumentCommand } from './commands/upload.command'
import { UpdateDocumentRequestDto } from './dto/update.request.dto'
import { UploadDocumentRequestDto } from './dto/upload.request.dto'
import { GetDocumentByIdQuery } from './query/getOne.document'
import { ListDocumentsQuery } from './query/list.document'

// JWT payload type based on JwtStrategy.validate() return value
interface JwtPayload {
  userId: string
  email: string
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // POST /documents — upload un fichier
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(pdf|jpeg|png|heic|docx|xlsx)/,
          }),
        ],
      }),
    )
    file: any,
    @Body() dto: UploadDocumentRequestDto,
  ) {
    // storageKey = chemin unique dans le stockage (ex: S3, local)
    const storageKey = `${user.userId}/${uuid()}-${file.originalname}`

    return this.commandBus.execute(
      new UploadDocumentCommand(
        user.userId,
        dto.fileName ?? file.originalname,
        file.mimetype,
        file.size,
        storageKey,
        dto.category,
        dto.tags ?? [],
        dto.expiresAt ? new Date(dto.expiresAt) : null,
      ),
    )
  }

  // GET /documents — liste avec filtres optionnels
  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query('category') category?: DocumentCategory,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.queryBus.execute(
      new ListDocumentsQuery(
        user.userId,
        category,
        search,
        page ? Number(page) : 1,
        pageSize ? Number(pageSize) : 20,
      ),
    )
  }

  // GET /documents/:id — détail d'un document
  @Get(':id')
  getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(
      new GetDocumentByIdQuery(id, user.userId),
    )
  }

  // PATCH /documents/:id — mise à jour des métadonnées
  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentRequestDto,
  ) {
    return this.commandBus.execute(
      new UpdateDocumentCommand(
        id,
        user.userId,
        dto.fileName,
        dto.category,
        dto.tags,
        dto.expiresAt !== undefined
          ? dto.expiresAt === null ? null : new Date(dto.expiresAt)
          : undefined,
        dto.isFavorite,
      ),
    )
  }

  // DELETE /documents/:id
  @Delete(':id')
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(
      new DeleteDocumentCommand(id, user.userId),
    )
  }
}