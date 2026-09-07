import { z } from "zod";

/**
 * The notify list. Deliberately small: applications are not open, so the only
 * thing we are entitled to collect is a way to tell someone when they are.
 */
export const notifySchema = z.object({
  email: z.email("That email does not look right.").max(200),
  school: z.string().trim().max(160).optional().default(""),
  role: z.enum(["student", "mentor", "sponsor", "other"]).default("student"),
});

export type NotifySignup = z.infer<typeof notifySchema>;
