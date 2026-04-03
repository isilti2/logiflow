import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await getResend().emails.send({
    from: 'LogiFlow <onboarding@resend.dev>',
    to,
    subject: 'Şifre Sıfırlama Talebi — LogiFlow',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:14px;">LF</span>
              </div>
              <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Logi<span style="opacity:0.85">Flow</span></span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111827;">Şifre Sıfırlama</h1>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
              Bu link <strong>1 saat</strong> geçerlidir. Talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.
            </p>
            <p style="margin:0;color:#d1d5db;font-size:12px;word-break:break-all;">
              ${resetUrl}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
