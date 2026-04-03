import { AuthDocument } from "src/schema/auth.schema";

export interface IAuthInterface {
  create(data: { email: string; passwordHash: string }): Promise<AuthDocument>
  // findByEmail(email: string): Promise<UserDocument | null>
  // findById(id: string): Promise<UserDocument | null>
  // existsByEmail(email: string): Promise<boolean>
}