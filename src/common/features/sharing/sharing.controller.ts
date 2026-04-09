import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Res,
  Req,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';

// Commands & Queries
import { GenererSharingCommand } from './command/generer-sharing';
import { RevoquerSharingCommand } from './command/revoquer-sharing';
import { TelechargementSharingCommand } from './command/telechargement-sharing';
import { GetSharingQuery } from './query/get.sharing-query';
import { GetAllHistoriqueQuery } from './query/getAll.historique-query';

// Auth & Types
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtPayload } from 'src/guards/jwt-payload.interface';
import { CurrentUser, Public } from 'src/guards/public.decorator';
import { SharingPermission } from 'src/schema/sharing.schema';
import { GenererSharingRequestDto } from './dto/request.dto';
import { SharingResponseDto } from './dto/reponse.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('sharing')
@ApiBearerAuth()
@Controller('sharing')
@UseGuards(JwtAuthGuard)
export class SharingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Helper privé pour générer l'URL sans utiliser le .env directement dans les méthodes
   * On utilise ici l'objet Request pour construire une URL absolue dynamiquement.
   */
  private getBaseUrl(req: Request, sharingId: string): string {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/sharing/${sharingId}`;
  }

  @Post(':documentId')
  @Public()
  async generer(
    @Param('documentId') documentId: string,
    @Body() dto: GenererSharingRequestDto,
    @Req() req: Request,
  ) {
    // Utilisateur spécifique hardcoded ou à définir selon vos besoins
    const usersId = '69ca796e7e1ea1ff70d7dcec'; // ObjectId valide (24 caractères hex)
    
    // Valeur par défaut si expirationHeures n'est pas fourni
    const expirationHeures = dto.expirationHeures || 24; // 24 heures par défaut
    try {
      const sharing = await this.commandBus.execute(
        new GenererSharingCommand(
          usersId,
          documentId,
          expirationHeures,
        )
      );
      
      // Générer l'URL complète de partage
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      return SharingResponseDto.fromDocument(sharing, baseUrl);
    } catch (error) {
      throw error;
    }
  }

  @Get('historique')
  @ApiOperation({ summary: 'Historique des partages' })
  async getHistorique(
    @CurrentUser() user: JwtPayload,
    @Query() dto: PaginationDto,
  ) {
    if (!user || !user.userId) {
      throw new UnauthorizedException("L'utilisateur n'est pas authentifié ou l'ID utilisateur est manquant");
    }

    return this.queryBus.execute(
      new GetAllHistoriqueQuery(
        user.userId,
        dto.page,
        dto.limit,
        dto.search,
        dto.dateCreationDebut,
        dto.dateCreationFin,
      ),
    );
  }

  @Patch(':sharingId/revoquer')
  @ApiOperation({ summary: 'Révoquer un lien' })
  async revoquer(
    @CurrentUser() user: JwtPayload,
    @Param('sharingId') sharingId: string,
    @Req() req: Request,
  ): Promise<SharingResponseDto> {
    if (!user || !user.userId) {
      throw new UnauthorizedException("L'utilisateur n'est pas authentifié ou l'ID utilisateur est manquant");
    }

    const sharing = await this.commandBus.execute(
      new RevoquerSharingCommand(sharingId, user.userId),
    );
    return SharingResponseDto.fromDocument(sharing, this.getBaseUrl(req, sharing._id));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Accès public aux métadonnées' })
  async acceder(@Param('id') id: string, @Req() req: Request) {
    return this.queryBus.execute(new GetSharingQuery(id, req.ip ?? 'unknown'));
  }

  @Get(':id/telecharger')
  @Public()
  @ApiOperation({ summary: 'Télécharger le document' })
  async telecharger(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const sharing = await this.commandBus.execute(
      new TelechargementSharingCommand(id, req.ip ?? 'unknown'),
    );

    if (sharing.permission !== SharingPermission.TELECHARGEMENT) {
      throw new ForbiddenException('TELECHARGEMENT_NON_AUTORISE');
    }

    const doc = sharing.documentId; // Supposé peuplé par le handler

    res.set({
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${doc.fileName}"`,
      'Content-Length': doc.fileSizeBytes,
      'Cache-Control': 'no-store', // Important pour la sécurité
    });

    return res.send(doc.fileData);
  }
}