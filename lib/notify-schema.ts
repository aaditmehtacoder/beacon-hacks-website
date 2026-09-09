import { z } from "zod";

const email = z
  .email("That email does not look right.")
  .max(200)
  .transform((v) => v.trim().toLowerCase());

/**
 * The notify list. For people who are not applying: mentors, judges,
 * sponsors, parents. One field required.
 */
export const notifySchema = z.object({
  email,
  school: z.string().trim().max(160).optional().default(""),
  role: z.enum(["student", "mentor", "sponsor", "other"]).default("other"),
});

/**
 * An early application. Short on purpose: enough to know who is coming and
 * to reach them. Nothing here promises a spot; confirmations go out once the
 * venue and the budget are locked.
 */
export const applySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80),
  email,
  school: z.string().trim().min(2, "Which school?").max(120),
  grade: z.enum(["9", "10", "11", "12"], { error: "Pick your grade." }),
  firstHackathon: z.boolean(),
  idea: z
    .string()
    .trim()
    .max(280, "Keep it under 280 characters.")
    .optional()
    .default(""),
});

export type NotifySignup = z.infer<typeof notifySchema>;
export type Application = z.infer<typeof applySchema>;

/** One row in the store. An application and a notify signup share a shape. */
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
