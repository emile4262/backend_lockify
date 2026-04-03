import { NotificationType } from "src/schema/notification.schema";

export class NotificationResponseDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly documentId: string | null,
    public readonly createdAt: string,
  ) {}

  static fromDocument(doc: any): NotificationResponseDto {
    return new NotificationResponseDto(
      doc._id.toString(),
      doc.userId.toString(),
      doc.type,
      doc.title,
      doc.message,
      doc.isRead,
      doc.documentId ? doc.documentId.toString() : null,
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt,
    )
  }
}

export class NotificationListResponseDto {
  constructor(
    public readonly items: NotificationResponseDto[],
    public readonly total: number,
    public readonly nonLues: number,
    public readonly page: number,
    public readonly pageSize: number,
  ) {}
}