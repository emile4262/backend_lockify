import {
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreateNotificationCommand } from '../commands/create.notification'
import { MarquerLueCommand } from '../commands/marquer.lues'
import { MarquerTousLuesCommand } from '../commands/marquer.tous.lues'
import { NotificationAllQuery } from '../query/notificationAll'
import { NombreNonLueQuery } from '../query/nombre.non.lue'
import { AlertesQuery } from '../query/alertes'
import { NotificationEntity, NotificationDocument, NotificationType } from 'src/schema/notification.schema'
import { NotificationResponseDto, NotificationListResponseDto } from '../../categories/dto/notification.dto'


@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  // ─────────────────────────────────────────────
  // COMMAND — Créer une notification
  // ─────────────────────────────────────────────
  async create(cmd: CreateNotificationCommand): Promise<NotificationResponseDto> {
    try {
      const notification = await this.notificationModel.create({
        userId:     cmd.userId,
        type:       cmd.type,
        title:      cmd.title,
        message:    cmd.message,
        documentId: cmd.documentId,
      })
      return NotificationResponseDto.fromDocument(notification)
    } catch (error) {
      throw new HttpException('Erreur lors de la création de la notification', 500)
    }
  }

  // ─────────────────────────────────────────────
  // COMMAND — Marquer une notification comme lue
  // ─────────────────────────────────────────────
  async marquerLue(cmd: MarquerLueCommand): Promise<NotificationResponseDto> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: cmd.notificationId, userId: cmd.userId },
        { $set: { isRead: true } },
        { new: true },
      )
      .lean()
      .exec()

    if (!notification) throw new NotFoundException('NOTIFICATION_NOT_FOUND')

    return NotificationResponseDto.fromDocument(notification)
  }

  // ─────────────────────────────────────────────
  // COMMAND — Marquer toutes les notifications comme lues
  // ─────────────────────────────────────────────
  async marquerToutesLues(cmd: MarquerTousLuesCommand): Promise<{ updated: number }> {
    const result = await this.notificationModel
      .updateMany(
        { userId: cmd.userId, isRead: false },
        { $set: { isRead: true } },
      )
      .exec()

    return { updated: result.modifiedCount }
  }

  // ─────────────────────────────────────────────
  // QUERY — Liste toutes les notifications
  // ─────────────────────────────────────────────
  async findAll(query: NotificationAllQuery): Promise<NotificationListResponseDto> {
    const skip = (query.page - 1) * query.pageSize

    const [items, total, nonLues] = await Promise.all([
      this.notificationModel
        .find({ userId: query.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({ userId: query.userId }),
      this.notificationModel.countDocuments({ userId: query.userId, isRead: false }),
    ])

    return new NotificationListResponseDto(
      items.map(NotificationResponseDto.fromDocument),
      total,
      nonLues,
      query.page,
      query.pageSize,
    )
  }

  // ─────────────────────────────────────────────
  // QUERY — Nombre de notifications non lues (badge)
  // ─────────────────────────────────────────────
  async nombreNonLues(query: NombreNonLueQuery): Promise<{ count: number }> {
    const count = await this.notificationModel.countDocuments({
      userId: query.userId,
      isRead: false,
    })
    return { count }
  }

  // ─────────────────────────────────────────────
  // QUERY — Alertes d'expiration non lues
  // ─────────────────────────────────────────────
  async alertesExpiration(query: AlertesQuery): Promise<NotificationResponseDto[]> {
    const typesExpiration = [
      NotificationType.EXPIRATION_J30,
      NotificationType.EXPIRATION_J15,
      NotificationType.EXPIRATION_J7,
      NotificationType.EXPIRATION_J1,
    ]

    const alertes = await this.notificationModel
      .find({
        userId: query.userId,
        type:   { $in: typesExpiration },
        isRead: false,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    return alertes.map(NotificationResponseDto.fromDocument)
  }
}