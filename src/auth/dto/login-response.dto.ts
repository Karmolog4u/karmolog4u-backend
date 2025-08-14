export class LoginResponseDto {
  user: {
    userData: any;
    accessToken: string;
    refreshToken: string;
  };
}
