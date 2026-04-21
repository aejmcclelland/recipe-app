import 'server-only';

const MAILEROO_BASE_URL = 'https://smtp.maileroo.com/api/v2';

type MailRecipientInput =
	| string
	| {
			address: string;
			displayName?: string;
			display_name?: string;
	  };

type MailResponse = {
	success?: boolean;
	message?: string;
	data?: unknown;
};

type SendMailArgs = {
	to: MailRecipientInput | MailRecipientInput[];
	subject: string;
	text?: string;
	html?: string;
};

type SendTemplatedMailArgs = {
	to: MailRecipientInput | MailRecipientInput[];
	subject: string;
	templateId: number | string;
	templateData?: Record<string, unknown>;
};

function getRequiredEnv(name: string): string {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`Missing ${name} in environment variables.`);
	}

	return value;
}

function normaliseRecipient(recipient: MailRecipientInput) {
	if (typeof recipient === 'string') {
		const address = recipient.trim();

		if (!address) {
			throw new Error('Email recipient address is required.');
		}

		return { address };
	}

	const address = recipient.address?.trim();
	if (!address) {
		throw new Error('Email recipient address is required.');
	}

	const displayName = recipient.displayName ?? recipient.display_name;

	return displayName
		? { address, display_name: displayName }
		: { address };
}

function normaliseRecipients(recipients: MailRecipientInput | MailRecipientInput[]) {
	if (Array.isArray(recipients)) {
		if (!recipients.length) {
			throw new Error('At least one email recipient is required.');
		}

		return recipients.map(normaliseRecipient);
	}

	return normaliseRecipient(recipients);
}

type MailAddress = {
	address: string;
	display_name?: string;
};

function getFromAddress(): MailAddress {
	const rawFrom = getRequiredEnv('MAILEROO_FROM');
	const trimmedFrom = rawFrom.trim();
	const ltIndex = trimmedFrom.lastIndexOf('<');
	const gtIndex = trimmedFrom.lastIndexOf('>');

	if (ltIndex === -1 || gtIndex === -1 || ltIndex > gtIndex) {
		return { address: trimmedFrom };
	}

	const displayName = trimmedFrom.slice(0, ltIndex).trim().replaceAll('"', '');
	const address = trimmedFrom.slice(ltIndex + 1, gtIndex).trim();

	if (!address) {
		throw new Error('MAILEROO_FROM must contain a valid email address.');
	}

	return displayName ? { address, display_name: displayName } : { address };
}

async function readMailerooResponse(response: Response) {
	const responseText = await response.text();

	if (!responseText) {
		return null;
	}

	try {
		return JSON.parse(responseText) as MailResponse;
	} catch {
		return responseText;
	}
}

async function mailerooRequest(path: string, payload: Record<string, unknown>) {
	const apiKey = getRequiredEnv('MAILEROO_API_KEY');

	const response = await fetch(`${MAILEROO_BASE_URL}${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
		body: JSON.stringify(payload),
	});

	const responseBody = await readMailerooResponse(response);

	const hasApiFailure =
		typeof responseBody === 'object' &&
		responseBody !== null &&
		'success' in responseBody &&
		responseBody.success === false;

	if (!response.ok || hasApiFailure) {
		const message =
			typeof responseBody === 'string'
				? responseBody
				: responseBody?.message ||
					`Maileroo request failed with status ${response.status}.`;

		throw new Error(message);
	}

	return responseBody;
}

export async function sendMail({ to, subject, text, html }: SendMailArgs) {
	if (!text && !html) {
		throw new Error('sendMail requires text, html, or both.');
	}

	return mailerooRequest('/emails', {
		from: getFromAddress(),
		to: normaliseRecipients(to),
		subject,
		...(typeof text === 'string' ? { plain: text } : {}),
		...(typeof html === 'string' ? { html } : {}),
	});
}

export async function sendTemplatedMail({
	to,
	subject,
	templateId,
	templateData = {},
}: SendTemplatedMailArgs) {
	const parsedTemplateId = Number(templateId);

	if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
		throw new Error('sendTemplatedMail requires a valid numeric templateId.');
	}

	return mailerooRequest('/emails/template', {
		from: getFromAddress(),
		to: normaliseRecipients(to),
		subject,
		template_id: parsedTemplateId,
		template_data: templateData,
	});
}
