import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Posle email. Pokud SMTP neni nastaveno v .env, jen to zaloguje do konzole
 * a tise pokracuje dal (necht to nerozbije registraci / odeslani dukazu).
 */
export async function sendMail({ to, subject, html }: SendArgs) {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || "Ultimate Streamer Challenge <noreply@example.com>";

  if (!transport) {
    console.warn(
      `[mail] SMTP neni nastaveno (.env) - email "${subject}" pro "${to}" se NEODESLAL. Nastav SMTP_HOST/SMTP_USER/SMTP_PASS v .env.`
    );
    return;
  }

  try {
    await transport.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error("[mail] Odeslani emailu se nezdarilo:", err);
  }
}

export function verificationEmailHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">Ahoj ${escapeHtml(name)},</h2>
      <p>Pro dokončení registrace na <strong>Ultimate Streamer Challenge</strong> potvrď svůj email kliknutím na tlačítko níže.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block;font-weight:bold;">
          Potvrdit email
        </a>
      </p>
      <p>Pokud tlačítko nefunguje, zkopíruj tento odkaz do prohlížeče:</p>
      <p style="word-break: break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color:#666;font-size:12px;margin-top:32px;">Odkaz je platný 24 hodin. Pokud jsi se nehlásil/a, tento email ignoruj.</p>
    </div>
  `;
}

export function adminNotificationHtml(opts: {
  userName: string;
  challengeTitle: string;
  proofUrl: string;
  adminUrl: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">Nový důkaz ke schválení</h2>
      <p><strong>${escapeHtml(opts.userName)}</strong> odeslal/a důkaz pro výzvu <strong>${escapeHtml(opts.challengeTitle)}</strong>.</p>
      <p>Odkaz na důkaz: <a href="${opts.proofUrl}">${opts.proofUrl}</a></p>
      <p style="margin: 24px 0;">
        <a href="${opts.adminUrl}" style="background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block;font-weight:bold;">
          Posoudit v administraci
        </a>
      </p>
      <p style="color:#666;font-size:12px;margin-top:32px;">
        Tyto notifikace si můžeš vypnout v Admin → Nastavení.
      </p>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
