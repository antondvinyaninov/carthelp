import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
    token?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: string[];
    accessToken?: string;
  }
}
