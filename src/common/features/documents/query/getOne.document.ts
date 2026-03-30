export class GetDocumentByIdQuery {
  constructor(
    public readonly documentId: string,
    public readonly ownerId: string,
  ) {}
}