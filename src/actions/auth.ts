"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail, verificationEmailHtml } from "@/lib/mail";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hodin

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

async function createAndSendVerification(userId: string, email: string, name: string) {
  // smaz stare nevyuzite tokeny tohoto uzivatele
  await prisma.verificationToken.deleteMany({ where: { userId } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const verifyUrl = `${getBaseUrl()}/verify?token=${token}`;
  await sendMail({
    to: email,
    subject: "Potvrď svůj email - Ultimate Streamer Challenge",
    html: verificationEmailHtml(name, verifyUrl),
  });
}

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || name.length < 2) {
    return { ok: false, error: "Zadej jmeno (alespon 2 znaky)." };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Zadej platny email." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Heslo musi mit alespon 6 znaku." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Tento email je uz registrovany." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "USER",
    },
  });

  await createAndSendVerification(user.id, user.email, user.name);

  return { ok: true };
}

export async function resendVerificationEmail(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Zadej platny email." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // z bezpecnostnich duvodu nerikame, jestli email existuje nebo ne
  if (!user || user.emailVerified) {
    return { ok: true };
  }

  await createAndSendVerification(user.id, user.email, user.name);
  return { ok: true };
}
