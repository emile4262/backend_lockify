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
  UnauthorizedException,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger'
import { CurrentUser, Public } from 'src/guards/public.decorator'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { DeleteDocumentCommand } from './commands/delete.command'
import { UpdateDocumentCommand } from './commands/update.command'
import { UploadDocumentCommand } from './commands/upload.command'
import { UpdateDocumentRequestDto } from './dto/update.request.dto'
import { UploadDocumentRequestDto } from './dto/upload.request.dto'
import { GetDocumentByIdQuery } from './query/getOne.document'
import { ListDocumentsQuery } from './query/list.document'
import { v4 as uuid } from 'uuid'
import { Types } from 'mongoose'
import { PaginationDto } from './dto/pagination.dto'
import { Express } from 'express'

// JWT payload type based on JwtStrategy.validate() return value
interface JwtPayload {
  userId: string
  email: string
}

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // POST /documents — upload un fichier
 @Post()
  @Public()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload un fichier document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileName: { type: 'string' },
        // category: {
        //   type: 'string',
        //   enum: Object.values(DocumentCategory),
        // },
        // tags:      { type: 'array', items: { type: 'string' } },
        // expiresAt: { type: 'string', format: 'date-time' },
      },
      required: ['file', ],
    },
  })
  async upload(
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
    file: Express.Multer.File,
    @Body() dto: UploadDocumentRequestDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    // Si non authentifié (endpoint public), ObjectId temporaire
    const userId = user?.userId ?? new Types.ObjectId().toString()
 
    return this.commandBus.execute(
      new UploadDocumentCommand(
        userId,
        dto.fileName ?? file.originalname,
        file.mimetype,
        file.size,
        file.buffer,              // stockage direct en BD
        dto.category,
        dto.expiresAt ? new Date(dto.expiresAt) : null,
      ),
    )
  }

  // GET /documents — liste avec filtres optionnels
  @Get('/:userId')
  @Public()
  list(
    @Param('userId') userId: string,
    @Query() dto: PaginationDto,
    @CurrentUser() user?: JwtPayload,
   
  ) {
    return this.queryBus.execute(
      new ListDocumentsQuery(
        userId,
        dto
      )
    );
  }

  // GET /documents/:id — détail d'un document
  @Get(':id')
  getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(
      new GetDocumentByIdQuery(id ),
    )
  }

  // PATCH /documents/:id — mise à jour des métadonnées
  @Patch(':id')
  @Public()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentRequestDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required for update operations');
    }
    
    return this.commandBus.execute(
      new UpdateDocumentCommand(
        id,
        user.userId,
        dto.fileName,
        dto.category,
        
      ),
    )
  }

  @Delete(':id')
  @Public()
  @ApiProperty({ description: 'supprimer tous les documents'})
  async delete(
    @Param('id') id: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteDocumentCommand(id, id),
    );

    return {
      message: 'document supprimé',
      data: result,
    };
  }
}