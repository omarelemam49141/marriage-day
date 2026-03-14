import { NextResponse } from "next/server";
import { MOSQUE_QUIZ_QUESTIONS } from "@/lib/mosque-quiz-questions";

const DEFAULT_TO = "omarelemam49141@gmail.com";
const DEFAULT_FROM = "Ishhar <no-reply@resend.dev>";

interface Body {
  firstName?: string;
  lastName?: string;
  answers?: Record<string, number>;
}

function buildAnswersHtml(answers: Record<string, number>): string {
  return MOSQUE_QUIZ_QUESTIONS.map((q, idx) => {
    const optIndex = answers[String(idx)];
    const optText =
      typeof optIndex === "number" && q.options[optIndex] != null
        ? q.options[optIndex]
        : "—";
    return `
    <div class="quiz-block" style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 1px solid #e8e0d5; background: #fefcf9;">
      <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; color: #5c4a3a; background: #f5ebe0; margin-bottom: 10px;">السؤال ${idx + 1}</div>
      <p style="font-size: 15px; color: #3a2a18; font-weight: 600; margin: 0 0 10px 0; line-height: 1.5;">${q.text}</p>
      <p style="font-size: 15px; color: #4a3420; padding: 12px 16px; border-radius: 8px; background: #fff8f0; border-right: 4px solid #c9a86c; margin: 0; line-height: 1.5;">${optText}</p>
    </div>`;
  }).join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;
    const firstName = body?.firstName?.toString().trim();
    const lastName = body?.lastName?.toString().trim();
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};

    if (!firstName) {
      return NextResponse.json(
        { success: false, error: "الاسم الأول مطلوب" },
        { status: 400 },
      );
    }
    if (!lastName) {
      return NextResponse.json(
        { success: false, error: "الاسم التاني مطلوب" },
        { status: 400 },
      );
    }

    const to = process.env.RSVP_TO_EMAIL || DEFAULT_TO;
    const from = process.env.RSVP_FROM_EMAIL || DEFAULT_FROM;
    const fullName = `${firstName} ${lastName}`;
    const now = new Date();
    const formattedDate = now.toLocaleString("ar-EG", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const answersRows = buildAnswersHtml(answers);

    const subject = `إجابات مسجد منة – ${fullName}`;

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .quiz-block { animation: fadeIn 0.45s ease-out both; }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%;">
  <div style="font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #2c3e50; max-width: 620px; margin: 0 auto;">
    <div style="margin-top: 20px; padding: 20px 0; border-width: 1px 0; border-style: dashed; border-color: #e0e0e0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="vertical-align: top; width: 60px;">
              <div style="padding: 10px 12px; margin: 0 12px; background: linear-gradient(135deg, #fff8f0 0%, #f5ebe0 100%); border-radius: 12px; font-size: 28px; text-align: center; border: 1px solid #e8dcc8;" role="img">📋</div>
            </td>
            <td style="vertical-align: top;">
              <div style="color: #2c3e50; font-size: 18px; font-weight: bold; margin-bottom: 4px;">إجابات مسجد منة – ${fullName}</div>
              <div style="color: #888; font-size: 13px; margin-bottom: 12px;">${formattedDate}</div>
              <p style="font-size: 14px; color: #555; margin: 0 0 20px 0; line-height: 1.6;">
                أقرت المدعوة <strong>${fullName}</strong> إنها هتلتزم بكل إجابة اختارتها والله على ما تقول شهيد.
              </p>
              <div style="margin-top: 16px;">
                ${answersRows}
              </div>
              <p style="font-size: 11px; color: #aaa; margin: 20px 0 0 0;">
                — أرسل أوتوماتيك من موقع إشّهار للعرسان منة وعمر
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الإيميل مش مُعد. لو بتشغّل المشروع محلياً، ضيف RESEND_API_KEY في ملف .env.local",
        },
        { status: 503 },
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

    const resendBody = await resendResponse.text().catch(() => "");

    if (!resendResponse.ok) {
      let errMessage = "فشل الإرسال، جربى تانى";
      try {
        const parsed = JSON.parse(resendBody) as { message?: string };
        if (parsed?.message) errMessage = parsed.message;
      } catch {
        // use default
      }
      return NextResponse.json(
        { success: false, error: errMessage, details: resendBody },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "حصلت مشكلة، جربى تانى" },
      { status: 500 },
    );
  }
}
