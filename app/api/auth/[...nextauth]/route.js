import NextAuth from 'next-auth';
import { authOptions } from '@/utils/authOptions';

console.log('authOptions:', authOptions);

const handler = NextAuth.default(authOptions);

export { handler as GET, handler as POST };
