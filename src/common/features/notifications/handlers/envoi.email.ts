import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { EnvoiEmailCommand } from '../commands/envoi.email'

@CommandHandler(EnvoiEmailCommand)
export class EnvoiEmailHandler implements ICommandHandler<EnvoiEmailCommand> {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async execute(cmd: EnvoiEmailCommand): Promise<{ queued: boolean }> {
    await this.emailQueue.add('send-email', {
      to:      cmd.to,
      subject: cmd.subject,
      body:    cmd.body,
      userId:  cmd.userId,
    })
    return { queued: true }
  }
}