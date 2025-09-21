export interface AuthResponse {
    user: {
      id: string;
      first_name: string;
      username?: string;
      photo_url?: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
    };
  }