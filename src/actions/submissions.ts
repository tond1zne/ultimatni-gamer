"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeek } from "@/lib/week";
import type { ActionResult } from "@/actions/auth";

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

  const week = await getCurrentWeek();

  const existing = await prisma.submission.findUnique({
    where: {
      userId_challengeId_weekId: {
        userId: session.user.id,
        challengeId,
        weekId: week.id,
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
      weekId: week.id,
      proofUrl,
      note: note || null,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/profile");
  revalidatePath("/admin/submissions");

  return { ok: true };
}
