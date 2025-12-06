import { getServerSession } from 'next-auth';

export const isAuthenticated = async (): Promise<boolean> => {
	const session = await getServerSession();
	return !!session?.user?.id;
};
