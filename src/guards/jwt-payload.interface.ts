// JWT payload type based on JwtStrategy.validate() return value
export interface JwtPayload {
  userId: string
  email: string
}
