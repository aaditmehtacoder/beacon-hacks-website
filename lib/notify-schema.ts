import { z } from "zod";

const email = z
  .email("That email does not look right.")
  .max(200)
  .transform((v) => v.trim().toLowerCase());

/**
 * The notify list. For people who are not applying: parents, mentors,
 * judges, sponsors. One field required.
 */
export const notifySchema = z.object({
  email,
  school: z.string().trim().max(160).optional().default(""),
  role: z.enum(["student", "parent", "mentor", "sponsor", "other"]).default("other"),
});

export type NotifySignup = z.infer<typeof notifySchema>;

/** One row in the store. Applications were taken here until Oct 25, 2026
    (registration is on Luma now), so old rows keep that shape. */
export type Entry = {
  id: string;
  kind: "application" | "notify";
  email: string;
  receivedAt: string;
  name?: string;
  school?: string;
  grade?: string;
  firstHackathon?: boolean;
  idea?: string;
  role?: string;
};
