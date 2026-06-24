import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { toggleAdminNotifications } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin" className="font-mono text-xs uppercase tracking-widest hover:underline">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase mt-2">Nastavení</h1>
      </div>

      <div className="comic-panel p-6 flex flex-col gap-5">
        <div>
          <h2 className="font-display text-xl uppercase">Email notifikace</h2>
          <p className="font-mono text-xs text-steel mt-1 max-w-md">
            Když je zapnuto, při každém novém odeslaném důkazu přijde email všem adminům
            ({admins.map((a) => a.email).join(", ") || "žádný admin účet"}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={settings.notifyAdminOnSubmission ? "tag tag-filled" : "tag"}
          >
            {settings.notifyAdminOnSubmission ? "ZAPNUTO" : "VYPNUTO"}
          </span>

          <form action={toggleAdminNotifications}>
            <input type="hidden" name="enabled" value={(!settings.notifyAdminOnSubmission).toString()} />
            <button type="submit" className="btn-comic-outline text-xs">
              {settings.notifyAdminOnSubmission ? "Vypnout" : "Zapnout"}
            </button>
          </form>
        </div>

        {!smtpConfigured && (
          <p className="font-mono text-xs border-2 border-ink p-3">
            SMTP zatím není nastaveno v <code>.env</code> (SMTP_HOST / SMTP_USER / SMTP_PASS) –
            emaily se i při zapnutém přepínači neodešlou, jen se zalogují do konzole serveru.
            Návod je v README.
          </p>
        )}
      </div>
    </div>
  );
}
