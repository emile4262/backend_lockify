import { SharingPermission, SharingStatus } from "src/schema/sharing.schema";

export class SharingResponseDto {
  constructor(
    public readonly id: string,
    public readonly usersId: string,
    public readonly documentId: string,
    public readonly lienPartage: string,
    public readonly permission: SharingPermission,
    public readonly status: SharingStatus,
    public readonly expiresAt: string,
    public readonly accessCount: number,
    public readonly createdAt: string,
  ) {}
 
  static fromDocument(doc: any, baseUrl?: string): SharingResponseDto {
    if (!doc || !doc._id) {
      throw new Error('Document invalide ou manquant');
    }
    
    return new SharingResponseDto(
      doc._id.toString(),
      doc.usersId?.toString() || '',
      doc.documentId?.toString() || '',
      baseUrl ? `${baseUrl}/sharing/${doc._id}` : '',
      doc.permission,
      doc.status,
      new Date(doc.expiresAt).toISOString(),
      doc.accessCount ?? 0,
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt,
    )
  }
}