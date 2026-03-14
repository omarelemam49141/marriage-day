import { NextResponse } from "next/server";

const DEFAULT_TO = "omarelemam49141@gmail.com";
const DEFAULT_FROM = "Ishhar <no-reply@resend.dev>";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { name?: string } | null;
    const name = body?.name?.toString().trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    const to = process.env.RSVP_TO_EMAIL || DEFAULT_TO;
    const from = process.env.RSVP_FROM_EMAIL || DEFAULT_FROM;

    const now = new Date();
    const formattedDate = now.toLocaleString("ar-EG", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `تلبية دعوة البيت عند منة – ${name}`;

    const html = `
      <div style="background-color:#fdf7ef;padding:24px;">
        <div style="max-width:520px;margin:0 auto;border-radius:16px;border:1px solid #e4d6c7;background-color:#fff7ec;padding:24px;text-align:center;font-family:'Tahoma',sans-serif;direction:rtl;">
          <p style="margin:0 0 8px;font-size:14px;color:#8b5e3c;">بسم الله الرحمن الرحيم</p>
          <h1 style="margin:8px 0 16px;font-size:22px;color:#3a2a18;">تلبية دعوة البيت عند منة</h1>
          <p style="margin:8px 0 16px;font-size:18px;color:#4a3420;">
            المزموزيل <strong>${name}</strong> لبّت الدعوة وهتيجى البيت عند منة إن شاء الله 💌
          </p>
          <hr style="border:none;border-top:1px dashed #e4d6c7;margin:16px 0;">
          <p style="margin:4px 0;font-size:13px;color:#6b4b32;">
            تاريخ التلبية: <span>${formattedDate}</span>
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#a07a55;">
            (الدعوة دى اتبعت أوتوماتيك من موقع إشّهار للعرسان منة وعمر)
          </p>
        </div>
      </div>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    const isDev = process.env.NODE_ENV !== "production";

    if (!apiKey) {
      if (isDev) {
        console.log("[RSVP dev] No RESEND_API_KEY – pretending email sent:", { to, subject, name });
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const text = await resendResponse.text().catch(() => "");
      return NextResponse.json(
        { success: false, error: "Failed to send email", details: text },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}

