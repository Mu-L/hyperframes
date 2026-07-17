import { parseHTML } from "linkedom";

/**
 * A privacy-preserving structural anatomy of a HyperFrames composition. The
 * agent fills this before submitting a non-clean `hyperframes feedback` so
 * maintainers can pattern-match the report against known bug families without
 * receiving the composition ZIP.
 *
 * Counts and presence flags only — no file paths, no src URLs, no user text.
 */
export interface CompositionCensus {
  /** Counts of media/graphic elements at the failing HTML pass. */
  elementCensus: {
    video: number;
    audio: number;
    img: number;
    svg: number;
    canvas: number;
    /** Sub-composition mount points (elements with `data-composition-src`). */
    subCompositionMounts: number;
  };
  /**
   * Union set of structural attributes present anywhere in the composition.
   * Each key is HF's capture-routing signal set (see references/preview-render.md).
   */
  structuralAttributes: {
    clipPath: boolean;
    filter: boolean;
    mixBlendMode: boolean;
    transform: boolean;
    mask: boolean;
    positionFixed: boolean;
    overflowHidden: boolean;
    zIndex: boolean;
    dataHasAudio: boolean;
    dataDuration: boolean;
    dataStart: boolean;
    dataCompositionSrc: boolean;
    backgroundImage: boolean;
    maskImage: boolean;
  };
  /**
   * Timeline shape summary. Distinguishes flat single-composition renders
   * from nested sub-composition trees, and GSAP-driven vs data-attribute-driven.
   */
  timelineShape: {
    /** True if any `data-composition-src` mount exists. */
    nested: boolean;
    /** Count of sub-composition mounts (`data-composition-src` count). */
    subCompositionCount: number;
    /** Any GSAP timeline usage (script tags referencing gsap or data-gsap-*). */
    usesGsap: boolean;
    /** Any element carrying `data-start` or `data-duration`. */
    usesDataTimeline: boolean;
  };
}

const SUB_COMPOSITION_SELECTOR = "[data-composition-src]";
const DATA_HAS_AUDIO_SELECTOR = "[data-has-audio]";
const DATA_DURATION_SELECTOR = "[data-duration]";
const DATA_START_SELECTOR = "[data-start]";

// Values that should NOT count as a "filter"/"mask"/"transform" attribute — the
// browser default. Explicit "none" is authored intent to disable, still counts
// as noteworthy for the census (author touched the property).
const EMPTY_VALUES = new Set(["", "initial", "unset"]);

function hasNonEmptyInlineStyle(el: Element, property: string): boolean {
  const raw = el.getAttribute("style");
  if (!raw) return false;
  // Case-insensitive property match. We intentionally do NOT parse CSS
  // shorthand-style semantics — a `background: url(...)` in the shorthand
  // still surfaces via a substring probe of the property token, which is
  // sufficient for structural presence signaling.
  const target = property.toLowerCase();
  const declarations = raw.split(";");
  for (const decl of declarations) {
    const colon = decl.indexOf(":");
    if (colon <= 0) continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    if (prop === target && !EMPTY_VALUES.has(value.toLowerCase())) return true;
  }
  return false;
}

function anyElementHasInlineStyle(doc: Document, property: string): boolean {
  const all = doc.querySelectorAll("[style]");
  for (const el of Array.from(all)) {
    if (hasNonEmptyInlineStyle(el as unknown as Element, property)) return true;
  }
  return false;
}

function hasStyleTagReferencing(doc: Document, needle: RegExp): boolean {
  const styles = doc.querySelectorAll("style");
  for (const styleEl of Array.from(styles)) {
    const text = (styleEl as unknown as Element).textContent ?? "";
    if (needle.test(text)) return true;
  }
  return false;
}

function detectGsap(doc: Document): boolean {
  const scripts = doc.querySelectorAll("script");
  for (const script of Array.from(scripts)) {
    const el = script as unknown as Element;
    const src = el.getAttribute("src") ?? "";
    if (/gsap/i.test(src)) return true;
    const text = el.textContent ?? "";
    if (/\bgsap\.(timeline|to|from|fromTo|set)\b/.test(text)) return true;
  }
  return false;
}

/**
 * Build a structural census of a composition HTML document. Counts elements
 * and probes for structural attributes without reading any user-supplied
 * strings (paths, src URLs, text content) beyond what's needed to detect
 * presence.
 *
 * Safe to call on partial/malformed HTML — linkedom's parser tolerates the
 * usual authoring accidents and the census reports zeros for missing sections.
 */
export function buildCompositionCensus(html: string): CompositionCensus {
  const doc = parseHTML(html).document as unknown as Document;

  const count = (selector: string): number => doc.querySelectorAll(selector).length;

  const subCompositionCount = count(SUB_COMPOSITION_SELECTOR);

  // Inline-style presence probes. Class-based rules would require full CSS
  // parsing — out of scope here. But we also check <style> tag contents as a
  // best-effort catch for authored stylesheets in the same file.
  const anyStyle = (property: string, styleRegex: RegExp): boolean =>
    anyElementHasInlineStyle(doc, property) || hasStyleTagReferencing(doc, styleRegex);

  return {
    elementCensus: {
      video: count("video"),
      audio: count("audio"),
      img: count("img"),
      svg: count("svg"),
      canvas: count("canvas"),
      subCompositionMounts: subCompositionCount,
    },
    structuralAttributes: {
      clipPath: anyStyle("clip-path", /clip-path\s*:/i),
      filter: anyStyle("filter", /(^|\s|\{)filter\s*:/i),
      mixBlendMode: anyStyle("mix-blend-mode", /mix-blend-mode\s*:/i),
      transform: anyStyle("transform", /(^|\s|\{)transform\s*:/i),
      mask: anyStyle("mask", /(^|\s|\{)mask\s*:/i),
      positionFixed:
        anyElementHasInlineStyle(doc, "position") ||
        hasStyleTagReferencing(doc, /position\s*:\s*fixed/i),
      overflowHidden: hasStyleTagReferencing(doc, /overflow\s*:\s*hidden/i),
      zIndex: anyStyle("z-index", /z-index\s*:/i),
      dataHasAudio: count(DATA_HAS_AUDIO_SELECTOR) > 0,
      dataDuration: count(DATA_DURATION_SELECTOR) > 0,
      dataStart: count(DATA_START_SELECTOR) > 0,
      dataCompositionSrc: subCompositionCount > 0,
      backgroundImage: anyStyle("background-image", /background(-image)?\s*:[^;]*url\(/i),
      maskImage: anyStyle("mask-image", /mask(-image)?\s*:[^;]*url\(/i),
    },
    timelineShape: {
      nested: subCompositionCount > 0,
      subCompositionCount,
      usesGsap: detectGsap(doc),
      usesDataTimeline: count(DATA_START_SELECTOR) + count(DATA_DURATION_SELECTOR) > 0,
    },
  };
}

/**
 * Render the census as the exact `COMPOSITION_STRUCTURE:` block the skill
 * mandates for non-10 visual-defect feedback. Reporter-friendly plain text:
 * element counts, present attributes as a comma-joined list, and a compact
 * timeline summary. Placeholder markers (`<...>`) are left for the reporter
 * to fill in for delta/defect location — those slots the parser can't infer
 * from HTML alone.
 */
export function renderCompositionCensusBlock(census: CompositionCensus): string {
  const { elementCensus, structuralAttributes, timelineShape } = census;

  const elementLine = [
    `video=${elementCensus.video}`,
    `audio=${elementCensus.audio}`,
    `img=${elementCensus.img}`,
    `svg=${elementCensus.svg}`,
    `canvas=${elementCensus.canvas}`,
    `subComps=${elementCensus.subCompositionMounts}`,
  ].join(" ");

  const attrPresent: string[] = [];
  const push = (key: keyof CompositionCensus["structuralAttributes"], label: string): void => {
    if (structuralAttributes[key]) attrPresent.push(label);
  };
  push("clipPath", "clip-path");
  push("filter", "filter");
  push("mixBlendMode", "mix-blend-mode");
  push("transform", "transform");
  push("mask", "mask");
  push("positionFixed", "position:fixed");
  push("overflowHidden", "overflow:hidden");
  push("zIndex", "z-index");
  push("dataHasAudio", "data-has-audio");
  push("dataDuration", "data-duration");
  push("dataStart", "data-start");
  push("dataCompositionSrc", "data-composition-src");
  push("backgroundImage", "background-image:url");
  push("maskImage", "mask-image:url");

  const attrLine = attrPresent.length > 0 ? attrPresent.join(", ") : "(none present)";

  const shape = timelineShape.nested
    ? `nested (${timelineShape.subCompositionCount} sub-comps)`
    : "flat";
  const driver =
    [
      timelineShape.usesGsap ? "gsap" : null,
      timelineShape.usesDataTimeline ? "data-timeline" : null,
    ]
      .filter(Boolean)
      .join("+") || "none";

  return [
    "COMPOSITION_STRUCTURE:",
    `  elements: ${elementLine}`,
    `  attributes: ${attrLine}`,
    `  timeline: ${shape}; driver=${driver}`,
    "  delta: <what differs between the working workaround-render and the broken default render>",
    "  defect: <spatial location + frame index range, e.g. top-left / frames 0-30 — omit for non-visual defects>",
  ].join("\n");
}
