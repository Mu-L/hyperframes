import { describe, expect, it } from "vitest";

import {
  COMPOSITION_STRUCTURE_RATING_CEILING,
  VISUAL_DEFECT_KEYWORDS,
  lintFeedbackComment,
  mentionsVisualDefect,
} from "./feedbackLint.js";

describe("lintFeedbackComment", () => {
  it("returns no warnings for a perfect rating regardless of comment", () => {
    expect(lintFeedbackComment({ rating: 10, comment: "black frame at 0.5s, no REPRO" })).toEqual(
      [],
    );
  });

  it("returns no warnings when the comment is missing or blank", () => {
    expect(lintFeedbackComment({ rating: 6, comment: undefined })).toEqual([]);
    expect(lintFeedbackComment({ rating: 6, comment: "" })).toEqual([]);
    expect(lintFeedbackComment({ rating: 6, comment: "   \n  " })).toEqual([]);
  });

  it("warns on non-10 comments missing REPRO COMMAND:", () => {
    const warnings = lintFeedbackComment({
      rating: 6,
      comment: "fast but crashed after a bit",
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.code).toBe("missing-repro-command");
    expect(warnings[0]?.message).toContain("REPRO COMMAND:");
  });

  it("stays silent when the reporter already included a REPRO COMMAND: block", () => {
    const warnings = lintFeedbackComment({
      rating: 4,
      comment: [
        "cloudrun submission kept timing out.",
        "REPRO COMMAND: cd project && npx hyperframes cloudrun submit",
        "EXPECTED / ACTUAL: uploads / hangs at seek",
      ].join("\n"),
    });
    expect(warnings).toEqual([]);
  });

  it("warns on rating<=7 visual-defect comments missing COMPOSITION_STRUCTURE:", () => {
    const warnings = lintFeedbackComment({
      rating: 5,
      comment: [
        "REPRO COMMAND: cd proj && npx hyperframes render",
        "EXPECTED / ACTUAL: output correct / black frame at 0.5s",
      ].join("\n"),
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.code).toBe("missing-composition-structure");
    expect(warnings[0]?.message).toContain("COMPOSITION_STRUCTURE:");
    expect(warnings[0]?.message).toContain("buildCompositionCensus");
  });

  it("skips the composition-structure warning above the rating ceiling", () => {
    const warnings = lintFeedbackComment({
      rating: COMPOSITION_STRUCTURE_RATING_CEILING + 1,
      comment: [
        "REPRO COMMAND: cd proj && npx hyperframes render",
        "minor black bar on the right edge; workaround with --resolution landscape",
      ].join("\n"),
    });
    // Missing structure warning is suppressed at rating 8+.
    expect(warnings.filter((w) => w.code === "missing-composition-structure")).toEqual([]);
  });

  it("skips the composition-structure warning when no visual-defect keyword is present", () => {
    const warnings = lintFeedbackComment({
      rating: 4,
      comment: [
        "docker mode always fails on Alpine",
        "REPRO COMMAND: docker run ... && npx hyperframes doctor --docker",
      ].join("\n"),
    });
    expect(warnings.filter((w) => w.code === "missing-composition-structure")).toEqual([]);
  });

  it("emits both warnings when a low-rating visual comment lacks both markers", () => {
    const warnings = lintFeedbackComment({
      rating: 3,
      comment: "flickers at every scene boundary",
    });
    expect(new Set(warnings.map((w) => w.code))).toEqual(
      new Set(["missing-repro-command", "missing-composition-structure"]),
    );
  });
});

describe("mentionsVisualDefect", () => {
  it.each(VISUAL_DEFECT_KEYWORDS.map((kw) => kw as string))(
    "matches keyword %j case-insensitively",
    (kw) => {
      expect(mentionsVisualDefect(`Reports a ${kw.toUpperCase()} issue`)).toBe(true);
    },
  );

  it("returns false for comments about non-visual friction", () => {
    expect(mentionsVisualDefect("cli hangs on init prompt in non-TTY shells")).toBe(false);
    expect(mentionsVisualDefect("cloudrun deploy expired auth token")).toBe(false);
  });
});
