import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSettings() {
  let settings = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: SETTINGS_ID, notifyAdminOnSubmission: true },
    });
  }
  return settings;
}

export async function setAdminNotifications(enabled: boolean) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, notifyAdminOnSubmission: enabled },
    update: { notifyAdminOnSubmission: enabled },
  });
}
