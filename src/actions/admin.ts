"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeCurrentWeekAndStartNext } from "@/lib/week";
import type { ActionResult } from "@/actions/auth";
import { Category, Difficulty } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Pristup odepren - pouze pro adminy.");
  }
  return session;
}

export async function approveSubmission(formData: FormData): Promise<ActionResult> {
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

export async function rejectSubmission(formData: FormData): Promise<ActionResult> {
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

export async function createChallenge(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "") as Category;
  const difficulty = String(formData.get("difficulty") || "") as Difficulty;
  const points = Number(formData.get("points") || 0);

  if (!title) return { ok: false, error: "Zadej nazev vyzvy." };
  if (!description) return { ok: false, error: "Zadej popis vyzvy." };
  if (!["GAME", "IRL"].includes(category)) return { ok: false, error: "Vyber kategorii." };
  if (!["EASY", "MEDIUM", "HARD", "INSANE"].includes(difficulty)) {
    return { ok: false, error: "Vyber obtiznost." };
  }
  if (!Number.isFinite(points) || points <= 0) {
    return { ok: false, error: "Body musi byt kladne cislo." };
  }

  await prisma.challenge.create({
    data: { title, description, category, difficulty, points: Math.round(points) },
  });

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");

}

export async function toggleArchiveChallenge(formData: FormData): Promise<ActionResult> {
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

}

export async function closeWeek(): Promise<ActionResult> {
  await requireAdmin();
  await closeCurrentWeekAndStartNext();

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/week");

  return { ok: true };
}
