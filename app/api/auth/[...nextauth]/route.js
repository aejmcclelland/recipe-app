// import NextAuth from 'next-auth';
// import { authOptions } from '@/utils/authOptions';

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

export function GET() {
	return new Response('ok from auth GET');
}

export function POST() {
	return new Response('ok from auth POST');
}
