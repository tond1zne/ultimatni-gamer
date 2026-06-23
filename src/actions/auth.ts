"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

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

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "USER",
    },
  });

  return { ok: true };
}
