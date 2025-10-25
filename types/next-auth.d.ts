// types/next-auth.d.ts
import { UserData } from './index';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string;
    email?: string;
    userData?: UserData; // Your custom data
  }

  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      userData?: UserData;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userData?: UserData;
  }
}