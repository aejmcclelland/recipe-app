export type SharingRecipient = { id: string; email: string };

export type SharingResult =
	| { status: 'ready' | 'already_shared'; recipient: SharingRecipient }
	| { status: 'unregistered'; email: string }
	| { status: 'recipients'; recipients: SharingRecipient[] }
	| { status: 'shared' | 'revoked' | 'invalid_email' | 'self' | 'unavailable' | 'rate_limited' | 'error' };
