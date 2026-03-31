import { env } from 'cloudflare:workers';

export const prerender = false;

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
	// const env = (locals as any).runtime?.env ?? {};
	const RESEND_API_KEY: string | undefined = env.RESEND_API_KEY;
	const TO_EMAIL: string = env.CONTACT_TO_EMAIL ?? "support@abmpartners.com.au";
	const FROM_EMAIL: string = env.CONTACT_FROM_EMAIL ?? "noreply@abmpartners.com.au";

	if (!RESEND_API_KEY) {
		return new Response(JSON.stringify({ error: "Email service not configured." }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	let data: FormData;
	try {
		data = await request.formData();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const name = (data.get("name") ?? "").toString().trim();
	const email = (data.get("email") ?? "").toString().trim();
	const message = (data.get("message") ?? "").toString().trim();

	if (!name || !email || !message) {
		return new Response(JSON.stringify({ error: "All fields are required." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return new Response(JSON.stringify({ error: "Invalid email address." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: `ABM Partners <${FROM_EMAIL}>`,
			to: [TO_EMAIL],
			reply_to: email,
			subject: `Contact form enquiry from ${name}`,
			text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
			html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
		}),
	});

	if (!res.ok) {
		const body = await res.text();
		console.error("Resend error:", res.status, body);
		return new Response(JSON.stringify({ error: "Failed to send message. Please try again later." }), {
			status: 502,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}
