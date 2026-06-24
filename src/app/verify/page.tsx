import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  if (!token) {
    return <VerifyResult ok={false} message="Chybí ověřovací token." />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return (
      <VerifyResult
        ok={false}
        message="Tento ověřovací odkaz už byl použit nebo neexistuje. Pokud je tvůj email už potvrzený, zkus se přihlásit."
      />
    );
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return (
      <VerifyResult
        ok={false}
        message="Odkaz vypršel (platnost 24 hodin). Na stránce přihlášení si můžeš vyžádat nový."
      />
    );
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId } });

  return <VerifyResult ok={true} message="Email byl potvrzen. Teď se můžeš přihlásit." />;
}

function VerifyResult({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className="max-w-md mx-auto comic-panel p-8 flex flex-col gap-4">
      <span className={ok ? "tag tag-filled w-fit" : "tag w-fit"}>
        {ok ? "ÚSPĚCH" : "NEPODAŘILO SE"}
      </span>
      <h1 className="font-display text-2xl uppercase">
        {ok ? "Email potvrzen" : "Ověření se nezdařilo"}
      </h1>
      <p className="font-mono text-sm text-steel">{message}</p>
      <Link href="/login" className="btn-comic w-fit mt-2">
        Přejít na přihlášení
      </Link>
    </div>
  );
}
