import NextAuthImport from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// In some bundler/interop situations, the imported value can be a module object.
// This makes it work whether the function is the import itself or under `.default`.
const NextAuth = NextAuthImport?.default ?? NextAuthImport;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
