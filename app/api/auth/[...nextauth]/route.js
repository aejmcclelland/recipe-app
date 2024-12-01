import NextAuth from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { DefaultAdapter } from 'next-auth/adapters';

const handler = NextAuth.default(authOptions);

export { handler as GET, handler as POST };
