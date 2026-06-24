"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekState } from "@/lib/week";
import { getSettings } from "@/lib/settings";
import { sendMail, adminNotificationHtml } from "@/lib/mail";
import type { ActionResult } from "@/actions/auth";

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function submitProof(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, error: "Pro odeslani dukazu se musis prihlasit." };
  }

  const challengeId = String(formData.get("challengeId") || "");
  const proofUrl = String(formData.get("proofUrl") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!challengeId) return { ok: false, error: "Chybi vyzva." };
  if (!proofUrl || !/^https?:\/\//i.test(proofUrl)) {
    return { ok: false, error: "Zadej platny odkaz (musi zacinat http:// nebo https://)." };
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.isArchived) {
    return { ok: false, error: "Tato vyzva uz neni aktivni." };
  }

  const { active } = await getWeekState();
  if (!active) {
    return { ok: false, error: "Týden ještě nebyl spuštěn adminem. Zkus to později." };
  }

  const existing = await prisma.submission.findUnique({
    where: {
      userId_challengeId_weekId: {
        userId: session.user.id,
        challengeId,
        weekId: active.id,
      },
    },
  });
  if (existing) {
    return { ok: false, error: "Tuto vyzvu jsi v tomto tydnu uz odeslal/a." };
  }

  await prisma.submission.create({
    data: {
      userId: session.user.id,
      challengeId,
      weekId: active.id,
      proofUrl,
      note: note || null,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/profile");
  revalidatePath("/admin/submissions");

  // Notifikace adminum - nezdar odeslani emailu nesmi shodit cely flow
  try {
    const settings = await getSettings();
    if (settings.notifyAdminOnSubmission) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      if (admins.length > 0) {
        await sendMail({
          to: admins.map((a) => a.email),
          subject: `Nový důkaz: ${challenge.title}`,
          html: adminNotificationHtml({
            userName: session.user.name,
            challengeTitle: challenge.title,
            proofUrl,
            adminUrl: `${getBaseUrl()}/admin/submissions`,
          }),
        });
      }
    }
  } catch (err) {
    console.error("[mail] Notifikace adminu se nezdarila:", err);
  }

  return { ok: true };
}
