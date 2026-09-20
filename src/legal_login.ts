import { z } from "zod";
import { infrai, InfraiError } from "./infrai.js";

export const intakeSchema = z.object({ matterId: z.string().min(1), phone: z.string().regex(/^\+[1-9]\d{7,14}$/), documentId: z.string().min(1), deadline: z.string().date() });
export type MatterIntake = z.infer<typeof intakeSchema>;

export async function requestMatterCode(input: unknown) {
  const matter = intakeSchema.parse(input);
  await infrai.sms.otp({ to: matter.phone }, `matter:${matter.matterId}:otp`);
  return { matterId: matter.matterId, next: "verify-code" as const };
}

export async function verifyMatterCode(input: unknown, code: string) {
  const matter = intakeSchema.parse(input);
  if (!/^\d{6}$/.test(code)) return { verified: false, reason: "six-digit code required" as const };
  try {
    const result = await infrai.sms.verify({ to: matter.phone, code }, `matter:${matter.matterId}:verify:${code}`);
    return result.verified ? { verified: true, signedDocument: matter.documentId, followUpOn: matter.deadline } : { verified: false, reason: "code rejected" as const };
  } catch (error) {
    if (error instanceof InfraiError && error.status < 500) return { verified: false, reason: "code rejected" as const };
    throw error;
  }
}
