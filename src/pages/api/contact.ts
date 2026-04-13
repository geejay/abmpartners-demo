import { env } from 'cloudflare:workers';

export const prerender = false;

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
	// const env = (locals as any).runtime?.env ?? {};
	const RESEND_API_KEY: string | undefined = env.RESEND_API_KEY;
	const TO_EMAILS: string[] = (env.CONTACT_TO_EMAILS ?? "").split(",").map((e: string) => e.trim()).filter(Boolean);
	const FROM_EMAIL: string | undefined = env.CONTACT_FROM_EMAIL;

	if (!RESEND_API_KEY || !TO_EMAILS.length || !FROM_EMAIL) {
		console.error("Email service not configured. Missing:", [
			!RESEND_API_KEY && "RESEND_API_KEY",
			!TO_EMAILS.length && "CONTACT_TO_EMAILS",
			!FROM_EMAIL && "CONTACT_FROM_EMAIL",
		].filter(Boolean).join(", "));
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

	const firstName = (data.get("first_name") ?? "").toString().trim();
	const lastName = (data.get("last_name") ?? "").toString().trim();
	const company = (data.get("company") ?? "").toString().trim();
	const jobTitle = (data.get("job_title") ?? "").toString().trim();
	const email = (data.get("email") ?? "").toString().trim();
	const phone = (data.get("phone") ?? "").toString().trim();
	const message = (data.get("message") ?? "").toString().trim();
	const name = `${firstName} ${lastName}`.trim();

	if (!firstName || !lastName || !company || !jobTitle || !email || !message) {
		return new Response(JSON.stringify({ error: "All required fields must be filled." }), {
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
			to: TO_EMAILS,
			reply_to: email,
			subject: `Contact form enquiry from ${name}`,
			text: `Name: ${name}\nCompany: ${company}\nJob Title: ${jobTitle}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`,
			html: `<p><strong>Name:</strong> ${name}</p><p><strong>Company:</strong> ${company}</p><p><strong>Job Title:</strong> ${jobTitle}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Phone:</strong> ${phone || "N/A"}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
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
