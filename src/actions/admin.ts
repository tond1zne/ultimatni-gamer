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
 
// Poznamka: tyto akce se pouzivaji primo jako <form action={...}> v admin strankach,
// proto vraci Promise<void> (ne objekt s ok/error) - jinak na ne TypeScript/React
// nahlasi typovou chybu pri buildu. Validacni chyby se proste tise ignoruji
// (admin formulare maji rozumne HTML required/min/max atributy, takze by k nim
// nemelo casto dochazet).
 
export async function approveSubmission(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const submissionId = String(formData.get("submissionId") || "");
  const pointsRaw = String(formData.get("points") || "");
  const points = Number(pointsRaw);
 
  if (!submissionId) return;
  if (!Number.isFinite(points) || points < 0) return;
 
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
}
 
export async function rejectSubmission(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const submissionId = String(formData.get("submissionId") || "");
  const reviewNote = String(formData.get("reviewNote") || "").trim();
 
  if (!submissionId) return;
 
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
}
 
export async function createChallenge(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "") as Category;
  const difficulty = String(formData.get("difficulty") || "") as Difficulty;
  const points = Number(formData.get("points") || 0);
 
  if (!title) return;
  if (!description) return;
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
 
export async function toggleArchiveChallenge(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const challengeId = String(formData.get("challengeId") || "");
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return;
 
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { isArchived: !challenge.isArchived },
  });
 
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");
}
 
export async function startWeek(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const weekId = String(formData.get("weekId") || "");
  const daysRaw = String(formData.get("days") || "7");
  const days = Number(daysRaw);
 
  if (!weekId) return;
  if (!Number.isFinite(days) || days < 1 || days > 60) return;
 
  try {
    await startWeekLib(weekId, Math.round(days));
  } catch {
    return;
  }
 
  revalidatePath("/");
  revalidatePath("/admin/week");
  revalidatePath("/leaderboard");
}
 
export async function closeWeek(): Promise<void> {
  await requireAdmin();
  await closeActiveWeekNow();
 
  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/week");
}
 
export async function toggleAdminNotifications(formData: FormData): Promise<void> {
  await requireAdmin();
 
  const enabled = String(formData.get("enabled") || "") === "true";
  await setAdminNotifications(enabled);
 
  revalidatePath("/admin/settings");
}