import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CreateNotificationCommand } from './commands/create.notification'
import { MarquerLueCommand } from './commands/marquer.lues'
import { MarquerTousLuesCommand } from './commands/marquer.tous.lues'
import { NotificationAllQuery } from './query/notificationAll'
import { NombreNonLueQuery } from './query/nombre.non.lue'
import { AlertesQuery } from './query/alertes'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { CurrentUser } from 'src/guards/public.decorator'
import { NotificationType } from 'src/schema/notification.schema'
import { JwtPayload } from 'src/guards/jwt-payload.interface'

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // GET /notifications — toutes les notifications
  @Get()
  @ApiOperation({ summary: 'Lister toutes les notifications' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.queryBus.execute(
      new NotificationAllQuery(
        user.userId,
        page     ? Number(page)     : 1,
        pageSize ? Number(pageSize) : 20,
      ),
    )
  }

  // GET /notifications/non-lues — badge compteur
  @Get('non-lues')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  nombreNonLues(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new NombreNonLueQuery(user.userId))
  }

  // GET /notifications/alertes — alertes expiration non lues
  @Get('alertes')
  @ApiOperation({ summary: 'Alertes d\'expiration non lues' })
  alertes(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new AlertesQuery(user.userId))
  }

  // PATCH /notifications/:id/lue — marquer une notification comme lue
  @Patch(':id/lue')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  marquerLue(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new MarquerLueCommand(id, user.userId))
  }

  // PATCH /notifications/toutes/lues — marquer toutes comme lues
  @Patch('toutes/lues')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  marquerToutesLues(@CurrentUser() user: JwtPayload) {
    return this.commandBus.execute(new MarquerTousLuesCommand(user.userId))
  }

  // POST /notifications — créer manuellement (usage interne / test)
  @Post()
  @ApiOperation({ summary: 'Créer une notification (usage interne)' })
  create(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandBus.execute(
      new CreateNotificationCommand(
        user.userId,
        NotificationType.INFO,
        'Test notification',
        'Ceci est une notification de test',
        [], // destinatairesProfils - empty array for test notification
      ),
    )
  }
}