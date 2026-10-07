import type { TKey } from "@/lib/i18n";

/** What every form server action returns so the client can show a translated error/success line. */
export type FormState = { ok: boolean; error?: TKey; notice?: TKey } | null;

export type QuizResult = {
  ok: boolean;
  error?: TKey;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  certificateId: string | null;
  review: { index: number; chosen: number; correct: number; explanation: string }[];
};