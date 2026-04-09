import {
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { CreateNotificationCommand } from '../commands/create.notification'
import { MarquerLueCommand } from '../commands/marquer.lues'
import { MarquerTousLuesCommand } from '../commands/marquer.tous.lues'
import { NotificationAllQuery } from '../query/notificationAll'
import { NombreNonLueQuery } from '../query/nombre.non.lue'
import { AlertesQuery } from '../query/alertes'
import { NotificationEntity, NotificationDocument, NotificationType } from 'src/schema/notification.schema'
import { NotificationResponseDto, NotificationListResponseDto } from '../../categories/dto/notification.dto'
import { UserDocument, User } from 'src/schema/users.schema'
import { MailService } from 'src/common/mail/mail'


@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly usersModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  // COMMAND — Créer une notification
  async create(params: { type: NotificationType;
     userId: string;
      title: string;
      message: string;
      destinatairesProfils: string[] 
  }) {
    const notification = new this.notificationModel({
      type: params.type,
      userId: params.userId,
      title: params.title,
      message: params.message,
      destinatairesProfils: params.destinatairesProfils,
    });

    const savedNotification = await notification.save();

    await this.envoyerEmailsNotification(savedNotification);
    return savedNotification;
  }

   private async envoyerEmailsNotification(notification: NotificationDocument ) {
    try {
      for (const profil of notification.destinatairesProfils) {
        const users = await this.usersModel.find({ profile: profil }).exec();
        for (const user of users) {
          if (user.email) {
            await this.mailService.sendMail(
              user.email,
              notification.title,
              `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2c3e50;">${notification.title}</h2>
                <p>${notification.message}</p>
                <hr style="border: 1px solid #eee;" />
                <p style="color: #7f8c8d; font-size: 12px;">
                  Notification automatique — Module Acquisition de Créances
                </p>
              </div>`,
            );
          }
        }
      }

      notification.emailEnvoye = true;
      await notification.save();
    } catch (error) {
      console.error('Erreur envoi emails notification:', error.message);
    }
  }


  // COMMAND — Marquer une notification comme lue
   async marquerCommeLue(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId).exec();
    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} non trouvée`);
    }

    const userObjectId = new Types.ObjectId(userId);
    if (!notification.lusParUtilisateurs.some(id => id.equals(userObjectId))) {
      notification.lusParUtilisateurs.push(userObjectId);
      await notification.save();
    }

    return { message: 'Notification marquée comme lue' };
  }

  // COMMAND — Marquer toutes les notifications comme lues
  async marquerToutesCommeLues(userId: string, documentId?: string) {
    const query: any = {};
    if (documentId) {
      query.documentId = new Types.ObjectId(documentId);
    }

    await this.notificationModel.updateMany(query, {
      $addToSet: { lusParUtilisateurs: new Types.ObjectId(userId) },
    });

    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }

  // QUERY — Liste toutes les notifications
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

  // QUERY — Nombre de notifications non lues (badge)
  async getNotificationsNonLues(userId: string, profil: string) {
    const notifications = await this.notificationModel
      .find({
        destinatairesProfils: profil,
        lusParUtilisateurs: { $ne: new Types.ObjectId(userId) },
      })
      .populate('emetteurId', 'nom prenom')
      .populate('documentId', 'userId')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return {
      count: notifications.length,
      notifications,
    };
  }

  // QUERY — Nombre de notifications non lues pour un utilisateur
  async nombreNonLues(query: NombreNonLueQuery): Promise<{ count: number }> {
    const count = await this.notificationModel.countDocuments({
      lusParUtilisateurs: { $ne: new Types.ObjectId(query.userId) },
    });
    
    return { count };
  }

  // QUERY — Alertes d'expiration non lues
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