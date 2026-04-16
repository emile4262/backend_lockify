import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GenererSharingCommand } from '../command/generer-sharing'
import { RevoquerSharingCommand } from '../command/revoquer-sharing'
import { ExpirationSharingCommand } from '../command/expiration-sharing'
import { TelechargementSharingCommand } from '../command/telechargement-sharing'
import { GetSharingQuery } from '../query/get.sharing-query'
import { SharingEntity, SharingDocument, SharingStatus } from 'src/schema/sharing.schema'
import { PaginationsDto } from '../../users/dto/pagination.dto'
import { PaginationService } from 'src/pagination/pagination'

declare global {
  var BASE_URL: string
}

@Injectable()
export class SharingRepository {
  constructor(
    @InjectModel(SharingEntity.name)
    private readonly sharingModel: Model<SharingDocument>,
  ) {}

  // ─────────────────────────────────────────────
  // COMMAND — Générer un lien de partage
  // ─────────────────────────────────────────────
  async generer(cmd: GenererSharingCommand): Promise<SharingDocument> {
    if (cmd.expirationHeures < 1 || cmd.expirationHeures > 720) {
      throw new BadRequestException('Expiration entre 1h et 720h (30 jours)')
    }

    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + cmd.expirationHeures)
 
      // Générer un token unique
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const sharing = await this.sharingModel.create({
        usersId:    cmd.usersId,
        documentId: cmd.documentId,
        token:      token,
        // permission: cmd.permission,
        status:     SharingStatus.ACTIF,
        expiresAt,
      })

      return sharing
    } catch (error) {
      throw new HttpException('Erreur lors de la génération du lien', 500)
    }
  }

  // ─────────────────────────────────────────────
  // COMMAND — Révoquer un lien de partage
  // ─────────────────────────────────────────────
  async revoquer(cmd: RevoquerSharingCommand): Promise<SharingDocument> {
    const sharing = await this.sharingModel
      .findOne({ _id: cmd.sharingId, usersId: cmd.usersId })
      .exec()

    if (!sharing) throw new NotFoundException('SHARING_NOT_FOUND')

    if (sharing.status === SharingStatus.REVOQUE) {
      throw new BadRequestException('SHARING_DEJA_REVOQUE')
    }

    sharing.status = SharingStatus.REVOQUE
    await sharing.save()

    return sharing
  }

  // ─────────────────────────────────────────────
  // COMMAND — Marquer un lien comme expiré
  // ─────────────────────────────────────────────
  async marquerExpire(cmd: ExpirationSharingCommand): Promise<void> {
    await this.sharingModel
      .findByIdAndUpdate(cmd.sharingId, {
        $set: { status: SharingStatus.EXPIRE },
      })
      .exec()
  }

  // ─────────────────────────────────────────────
  // COMMAND — Enregistrer un téléchargement
  // ─────────────────────────────────────────────
  async enregistrerTelechargement(
    cmd: TelechargementSharingCommand,
  ): Promise<SharingDocument> {
    const sharing = await this.sharingModel
      .findOne({ _id: cmd.id, status: SharingStatus.ACTIF })
      .exec()

    if (!sharing) throw new NotFoundException('LIEN_INVALIDE_OU_EXPIRE')

    // Vérifier si le lien n'est pas expiré
    if (new Date() > new Date(sharing.expiresAt)) {
      sharing.status = SharingStatus.EXPIRE
      await sharing.save()
      throw new ForbiddenException('LIEN_EXPIRE')
    }

    // Enregistrer l'accès dans l'historique
    sharing.accessCount += 1
    sharing.accessHistory.push({
      accessedAt: new Date(),
      ip: cmd.ip,
    })
    await sharing.save()

    return sharing
  }

  // ─────────────────────────────────────────────
  // QUERY — Récupérer un partage par token
  // ─────────────────────────────────────────────
  async getByToken(query: GetSharingQuery): Promise<SharingDocument> {
    const sharing = await this.sharingModel
      .findOne({ _id: query.id })
      .populate('documentId', null, 'DocumentEntity')
      .exec()

    if (!sharing) throw new NotFoundException('LIEN_INVALIDE')

    if (sharing.status !== SharingStatus.ACTIF) {
      throw new ForbiddenException('LIEN_REVOQUE_OU_EXPIRE')
    }

    if (new Date() > new Date(sharing.expiresAt)) {
      sharing.status = SharingStatus.EXPIRE
      await sharing.save()
      throw new ForbiddenException('LIEN_EXPIRE')
    }

    return sharing
  }

  // ─────────────────────────────────────────────
  // QUERY — Historique complet des partages
  // ─────────────────────────────────────────────
  async getAllHistorique(
      usersId: string,
      dto: PaginationsDto,
    ): Promise<PaginationService<SharingDocument>>{
      const { search, page, limit, dateCreationDebut, dateCreationFin } = dto;
      const query: any = { usersId };
  
      const Page = page ? parseInt(String(page), 10) : 1;
      const Limit = limit ? parseInt(String(limit), 10) : 10;
  
      if (search) {
        query.accessLink = { $regex: search, $options: 'i' };
      }
      // Filtres de date - corrigé pour fonctionner individuellement
      if (dateCreationDebut || dateCreationFin) {
        query.createdAt = {};
        if (dateCreationDebut) {
          query.createdAt.$gte = new Date(dateCreationDebut);
        }
        if (dateCreationFin) {
          const endDate = new Date(dateCreationFin);
          endDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = endDate;
        }
      }
  
      const data = await this.sharingModel
        .find(query)
        .sort({ createdAt: 'desc', _id: 'desc' })
        .skip((Page - 1) * Limit)
        .limit(Limit)
        .exec();
              
      const total = await this.sharingModel.countDocuments(query);
      return new PaginationService<SharingDocument>(data, Page, Limit, total);
    }
}