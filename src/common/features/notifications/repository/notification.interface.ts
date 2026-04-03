import { CreateNotificationCommand } from '../commands/create.notification'
import { MarquerLueCommand } from '../commands/marquer.lues'
import { MarquerTousLuesCommand } from '../commands/marquer.tous.lues'
import { NotificationAllQuery } from '../query/notificationAll'
import { NombreNonLueQuery } from '../query/nombre.non.lue'
import { AlertesQuery } from '../query/alertes'
import { NotificationListResponseDto, NotificationResponseDto } from '../../categories/dto/notification.dto'

export interface INotificationRepository {
  create(cmd: CreateNotificationCommand): Promise<NotificationResponseDto>
  marquerLue(cmd: MarquerLueCommand): Promise<NotificationResponseDto>
  marquerToutesLues(cmd: MarquerTousLuesCommand): Promise<{ updated: number }>
  findAll(query: NotificationAllQuery): Promise<NotificationListResponseDto>
  nombreNonLues(query: NombreNonLueQuery): Promise<{ count: number }>
  alertesExpiration(query: AlertesQuery): Promise<NotificationResponseDto[]>
}