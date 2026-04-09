import { SharingPermission } from "src/schema/sharing.schema";

export class GenererSharingCommand {
  constructor(
    public readonly usersId: string,
    public readonly documentId: string,
    // public readonly permission: SharingPermission,
    public readonly expirationHeures: number, // 1h à 720h (30 jours)
  ) {}
}