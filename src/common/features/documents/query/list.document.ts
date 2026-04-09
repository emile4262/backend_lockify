import { PaginationDto } from "../dto/pagination.dto";

export class ListDocumentsQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination?: PaginationDto,
  ) {}
}