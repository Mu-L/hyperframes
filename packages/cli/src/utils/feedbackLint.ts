import { FEEDBACK_RATING_SCALE } from "./feedbackRating.js";

/**
 * Keywords that suggest the reporter is describing a visual defect (as opposed
 * to a build failure, missing feature, or plain workflow friction). When these
 * appear in a non-10 feedback comment, the reporter should include a
 * `COMPOSITION_STRUCTURE:` block so maintainers can pattern-match against
 * known bug families without receiving the composition ZIP. Matched
 * case-insensitively against the raw comment.
 *
 * Keep the list short and unambiguous — false positives are cheap (a soft
 * warn), false negatives just mean the reporter skips the structure block on
 * a non-visual bug, which is fine.
 */
export const VISUAL_DEFECT_KEYWORDS: readonly string[] = [
  "black",
  "flicker",
  "corrupt",
  "wrong frame",
  "blank",
  "visual",
  "render",
] as const;

/**
 * Ratings that should mandate `COMPOSITION_STRUCTURE:` when the comment
 * contains a visual-defect keyword. 7 and below covers "clearly broken" —
 * 8-9 are usually "worked, but noticed a nit" which doesn't need the full
 * structural anatomy.
 */
export const COMPOSITION_STRUCTURE_RATING_CEILING = 7;

const REPRO_MARKER = "REPRO COMMAND:";
const STRUCTURE_MARKER = "COMPOSITION_STRUCTURE:";

export interface FeedbackLintInput {
  rating: number;
  comment: string | undefined;
}

export interface FeedbackLintWarning {
  code: "missing-repro-command" | "missing-composition-structure";
  message: string;
}

/**
 * Soft-warn lint on the `hyperframes feedback` comment body. Never blocks
 * submission — some legitimate reports (a one-line "cloudrun quota bumped
 * yesterday, fine now") won't fit the mold. The warning is just a nudge and
 * a pointer to the auto-census helper.
 *
 * Rules:
 *  1. `rating === 10` — no check. A perfect run doesn't need a repro packet.
 *  2. Comment missing / empty — no check. `feedback --rating 6` with no
 *     comment is a valid quick vote; the maintainer sees rating drift without
 *     the reporter having to synthesize a fake repro.
 *  3. Comment present + rating < 10 + no `REPRO COMMAND:` — warn.
 *  4. Comment present + rating ≤ 7 + visual-defect keyword + no
 *     `COMPOSITION_STRUCTURE:` — warn (in addition to any #3 warning).
 */
export function lintFeedbackComment(input: FeedbackLintInput): FeedbackLintWarning[] {
  const { rating, comment } = input;
  if (rating === FEEDBACK_RATING_SCALE) return [];
  const trimmed = comment?.trim();
  if (!trimmed) return [];

  const warnings: FeedbackLintWarning[] = [];

  if (!trimmed.includes(REPRO_MARKER)) {
    warnings.push({
      code: "missing-repro-command",
      message: [
        `Comment on a ${rating}/${FEEDBACK_RATING_SCALE} report is missing a "${REPRO_MARKER}" block —`,
        "maintainers can't rerun the failure from a symptom summary alone.",
        "See `references/preview-render.md` → feedback for the required packet shape.",
      ].join(" "),
    });
  }

  if (
    rating <= COMPOSITION_STRUCTURE_RATING_CEILING &&
    mentionsVisualDefect(trimmed) &&
    !trimmed.includes(STRUCTURE_MARKER)
  ) {
    warnings.push({
      code: "missing-composition-structure",
      message: [
        `Comment describes a visual defect at ${rating}/${FEEDBACK_RATING_SCALE} but omits a`,
        `"${STRUCTURE_MARKER}" block. Agents can auto-fill this via the composition-census helper`,
        "(`buildCompositionCensus`/`renderCompositionCensusBlock` in `packages/cli/src/utils/compositionCensus.ts`)",
        "so maintainers can pattern-match against known bug families without the composition ZIP.",
      ].join(" "),
    });
  }

  return warnings;
}

/**
 * Case-insensitive substring probe against `VISUAL_DEFECT_KEYWORDS`. Exposed
 * for tests and reuse; keywords are matched anywhere in the comment (no word
 * boundaries) since real reports mix them into free prose. False positives
 * cost one soft warn, which is acceptable.
 */
export function mentionsVisualDefect(comment: string): boolean {
  const lower = comment.toLowerCase();
  for (const kw of VISUAL_DEFECT_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}
