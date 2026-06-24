"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startWeek as startWeekLib, closeActiveWeekNow } from "@/lib/week";
import { setAdminNotifications } from "@/lib/settings";
import { Category, Difficulty } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Pristup odepren - pouze pro adminy.");
  }
  return session;
}

export async function approveSubmission(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const submissionId = String(formData.get("submissionId") || "");
  const pointsRaw = String(formData.get("points") || "");
  const points = Number(pointsRaw);

  if (!submissionId) return { ok: false, error: "Chybi submission." };
  if (!Number.isFinite(points) || points < 0) {
    return { ok: false, error: "Body musi byt cislo >= 0." };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "APPROVED",
      pointsAwarded: Math.round(points),
      reviewedAt: new Date(),
      reviewNote: null,
    },
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");

  return { ok: true };
}

export async function rejectSubmission(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const submissionId = String(formData.get("submissionId") || "");
  const reviewNote = String(formData.get("reviewNote") || "").trim();

  if (!submissionId) return { ok: false, error: "Chybi submission." };

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      pointsAwarded: 0,
      reviewedAt: new Date(),
      reviewNote: reviewNote || "Neuznano adminem.",
    },
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/profile");

  return { ok: true };
}

export async function createChallenge(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "") as Category;
  const difficulty = String(formData.get("difficulty") || "") as Difficulty;
  const points = Number(formData.get("points") || 0);

  if (!title || !description) return;
  if (!["GAME", "IRL"].includes(category)) return;
  if (!["EASY", "MEDIUM", "HARD", "INSANE"].includes(difficulty)) return;
  if (!Number.isFinite(points) || points <= 0) return;

  await prisma.challenge.create({
    data: { title, description, category, difficulty, points: Math.round(points) },
  });

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");
}

export async function toggleArchiveChallenge(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const challengeId = String(formData.get("challengeId") || "");
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return { ok: false, error: "Vyzva nenalezena." };

  await prisma.challenge.update({
    where: { id: challengeId },
    data: { isArchived: !challenge.isArchived },
  });

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");

  return { ok: true };
}

export async function startWeek(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const weekId = String(formData.get("weekId") || "");
  const daysRaw = String(formData.get("days") || "7");
  const days = Number(daysRaw);

  if (!weekId) return { ok: false, error: "Chybí týden ke spuštění." };
  if (!Number.isFinite(days) || days < 1 || days > 60) {
    return { ok: false, error: "Délka týdne musí být 1–60 dní." };
  }

  try {
    await startWeekLib(weekId, Math.round(days));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Nepodařilo se spustit týden." };
  }

  revalidatePath("/");
  revalidatePath("/admin/week");
  revalidatePath("/leaderboard");

  return { ok: true };
}

export async function closeWeek(): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await closeActiveWeekNow();

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/week");

  return { ok: true };
}

export async function toggleAdminNotifications(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const enabled = String(formData.get("enabled") || "") === "true";
  await setAdminNotifications(enabled);

  revalidatePath("/admin/settings");

  return { ok: true };
}
