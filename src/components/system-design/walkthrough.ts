/** Types and colours shared by LessonWalkthrough and the lesson animations that use it. */

export type WalkthroughStat = {
  label: string;
  value: string;
  tone?: "mint" | "violet" | "amber";
};

export type WalkthroughStep = {
  /** Which preset pill this step belongs to. */
  group: string;
  /** Status card title, sentence case. */
  phase: string;
  /** One or two sentences: what happens and why. */
  narration: string;
  /** Keep the same labels on every step; show "·" for "not yet". */
  stats: WalkthroughStat[];
};

export const WALKTHROUGH_TONE: Record<NonNullable<WalkthroughStat["tone"]>, string> = {
  mint: "text-mint",
  violet: "text-violet",
  amber: "text-amber-600 dark:text-amber-400",
};
