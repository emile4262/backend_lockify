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
  UnauthorizedException,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiProperty, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { CurrentUser, Public } from 'src/guards/public.decorator'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { DeleteDocumentCommand } from './commands/delete.command'
import { UpdateDocumentCommand } from './commands/update.command'
import { UploadDocumentCommand } from './commands/upload.command'
import { UpdateDocumentRequestDto } from './dto/update.request.dto'
import { UploadDocumentRequestDto } from './dto/upload.request.dto'
import { GetDocumentByIdQuery } from './query/getOne.document'
import { ListDocumentsQuery } from './query/list.document'
import { Types } from 'mongoose'
import { PaginationDto } from './dto/pagination.dto'
import type { Express } from 'express'

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
  // @ApiQuery({ name: 'typeDocument', required: false, enum: [
  //   'IDENTITE',
  //   'SANTE',
  //   'FINANCE',
  //   'TRAVAIL',
  //   'LOGEMENT',
  //   'FAMILLE',
  //   'CONTRAT', 
  //   'FACTURE', 
  //   'PIECE_IDENTITE', 
  //   'PERMIS_CONDUITE', 
  //   'PASSEPORT', 
  //   'JURIDIQUE', 
  //   'AUTRE'
  // ] })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier Excel',
        },
        fileName: { type: 'string' },
          
        typeDocument: { type: 'string', enum: [
          'IDENTITE',
          'SANTE',
          'FINANCE',
          'TRAVAIL',
          'LOGEMENT',
          'FAMILLE',
          'CONTRAT', 
          'FACTURE', 
          'PIECE_IDENTITE', 
          'PERMIS_CONDUITE', 
          'PASSEPORT', 
          'JURIDIQUE', 
          'AUTRE'
        ] },
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
        ],
        fileIsRequired: true,
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
        dto.typeDocument ?? dto.DocumentCategory, // Utilise l'alias si typeDocument n'est pas fourni
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
        dto.typeDocument,
        
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