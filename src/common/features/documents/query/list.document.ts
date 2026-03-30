import { DocumentCategory } from "src/common/schema/documents.schema";

export class ListDocumentsQuery {
  constructor(
    public readonly ownerId: string,
    public readonly category?: DocumentCategory,
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly pageSize: number = 20,
  ) {}
}