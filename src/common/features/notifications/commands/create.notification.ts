import { NotificationType } from "src/schema/notification.schema";
export class CreateNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly documentId: string | null = null,
  ) {}
}