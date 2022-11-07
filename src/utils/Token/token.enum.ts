export interface TokenAccess {
  token: string;
  expiresIn: number;
  refreshToken: string;
  id?: string;
}

export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token'
}