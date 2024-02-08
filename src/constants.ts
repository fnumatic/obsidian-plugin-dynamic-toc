import {
  DynamicTOCSettings,
  ExternalMarkdownKey,
  EXTERNAL_MARKDOWN_PREVIEW_STYLE,
} from "./types";

export const DEFAULT_SETTINGS: DynamicTOCSettings = {
  style: "bullet",
  min_depth: 2,
  max_depth: 6,
  externalStyle: "None",
  supportAllMatchers: false,
  allow_inconsistent_headings: false,
  embeddedHeadings: true,
};

export const CLASS_TOC = "dynamic-toc";
export const CLASS_TOC_INLINE = "dynamic-toc-inline";
export const SELECTOR_TOC = `.${CLASS_TOC}`;

export const ALL_MATCHERS = Object.keys(
  EXTERNAL_MARKDOWN_PREVIEW_STYLE
) as ExternalMarkdownKey[];
