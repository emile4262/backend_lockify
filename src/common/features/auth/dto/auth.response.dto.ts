export class AuthResponseDto {
  constructor(
    public readonly accessToken: string,
    public readonly userId: string,
    public readonly email: string,
  ) {}
}