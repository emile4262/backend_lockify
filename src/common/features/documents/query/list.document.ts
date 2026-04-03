import { DocumentCategory } from "src/schema/documents.schema";
import { PaginationDto } from "../dto/pagination.dto";

export class ListDocumentsQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination?: PaginationDto,
  ) {}
}