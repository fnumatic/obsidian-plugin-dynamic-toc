/// <reference types="vitest/globals" />

import { vi } from "vitest";
import type { CachedMetadata, HeadingCache, MetadataCache } from "obsidian";
import { TableOptions, EmbeddedHeadings } from "src/types";
import { extractHeadings, mergeHeadings, getEmbeddedHeadings } from "../extract-headings";

describe("Extract headings", () => {
  describe("build markdown text", () => {
    const defaultHeadings = {
      headings: [
        {
          heading: "foo",
          level: 1,
        },
        {
          heading: "bar",
          level: 2,
        },
        {
          heading: "baz",
          level: 3,
        },
        {
          heading: "[[Something|Alt Text]]",
          level: 4,
        },
        {
          heading: "level 1",
          level: 1,
        },
        {
          heading: "level 1 a",
          level: 2,
        },
      ],
    } as CachedMetadata;
    it("should match snapshot", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "number",
      } as TableOptions;
      expect(extractHeadings(defaultHeadings as CachedMetadata, options)).toMatchSnapshot();
    });

    it("should match snapshot when varied_style is true and style is bullet", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "bullet",
        varied_style: true,
      } as TableOptions;
      expect(extractHeadings(defaultHeadings, options)).toMatchSnapshot();
    });
    it("should match snapshot when varied_style is true and style is number", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "number",
        varied_style: true,
      } as TableOptions;
      expect(extractHeadings(defaultHeadings, options)).toMatchSnapshot();
    });

    it("should match snapshot with title", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "number",
        title: "## Table of Contents",
      } as TableOptions;
      expect(extractHeadings(defaultHeadings, options)).toMatchSnapshot();
    });

    it("should match snapshot with inconsistent heading levels", () => {
      const fileMetaData = {
        headings: [
          {
            heading: "Level 2",
            level: 2,
          },
          {
            heading: "Level 4",
            level: 4,
          },
          {
            heading: "Level 5",
            level: 5,
          },
          {
            heading: "Level 2",
            level: 2,
          },
          {
            heading: "Level 3",
            level: 3,
          },
        ],
      } as CachedMetadata;
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "number",
        allow_inconsistent_headings: true,
      } as TableOptions;
      expect(extractHeadings(fileMetaData, options)).toMatchSnapshot();
    });
  });
  describe("build inline markdown text", () => {
    const defaultHeadings = {
      headings: [
        {
          heading: "foo",
          level: 2,
        },
        {
          heading: "bar",
          level: 3,
        },
        {
          heading: "baz",
          level: 2,
        },
        {
          heading: "[[Something|Alt Text]]",
          level: 2,
        },
      ],
    } as CachedMetadata;
    it("should render correct markdown", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "inline",
      } as TableOptions;
      const result = extractHeadings(defaultHeadings, options);
      expect(result).toEqual(
        "[[#foo]] | [[#baz]] | [[#Something Alt Text|Alt Text]]"
      );
    });
    it("should accept a different delimiter", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "inline",
        delimiter: "*",
      } as TableOptions;
      const result = extractHeadings(defaultHeadings, options);
      expect(result).toEqual(
        "[[#foo]] * [[#baz]] * [[#Something Alt Text|Alt Text]]"
      );
    });
    it("should trim user delimiter", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "inline",
        delimiter: " * ",
      } as TableOptions;
      const result = extractHeadings(defaultHeadings, options);
      expect(result).toEqual(
        "[[#foo]] * [[#baz]] * [[#Something Alt Text|Alt Text]]"
      );
    });
  });
});

describe("Extract embedded headings", () => {
  describe("build markdown text", () => {
    const defaultHeadings = [
        {
          heading: "foo",
          level: 2,
        },
        {
          heading: "![[bar emb]]",
          level: 2,
        },
      ] as HeadingCache[];
    const embeddedHeadings = {
      "![[bar emb]]": [
        {
          heading: "bar emb L2",
          level: 2,
        },
        {
          heading: "bar emb L3",
          level: 3,
        },
      ] as HeadingCache[] ,
    } as EmbeddedHeadings ;
    it("should match snapshot", () => {
      const options = {
        max_depth: 4,
        min_depth: 1,
        style: "bullet",
      } as TableOptions;
      expect(extractHeadings(mergeHeadings(defaultHeadings,embeddedHeadings), options)).toMatchSnapshot();
    });
  });
})

describe("Extract embedded headings 2", () => {
  describe("build markdown text", () => {
    const defaultHeadings = [
        {
          heading: "foo",
          level: 2,
        },
        {
          heading: "![[bar emb#emb L2.1]]",
          level: 2,
        },
      ] as HeadingCache[];
    const embeddedHeadings = {
      "![[bar emb#emb L2.1]]": [
        {
          heading: "bar emb",
          level: 1,
        },
        {
          heading: "emb L2.1",
          level: 2,
        },
        {
          heading: "emb L3.1",
          level: 3,
        },
        {
          heading: "emb L2.2",
          level: 2,
        },
        {
          heading: "emb L3.2",
          level: 3,
        },
      ] as HeadingCache[] ,
    } as EmbeddedHeadings ;
    it("should match snapshot", () => {
      const options = {
        max_depth: 5,
        min_depth: 1,
        style: "bullet",
      } as TableOptions;
      expect(extractHeadings(mergeHeadings(defaultHeadings,embeddedHeadings), options)).toMatchSnapshot();
    });
  });
})

describe("Null reference fixes", () => {
  describe("getEmbeddedHeadings - linkToCachedMetadata null safety", () => {
    it("should handle non-existent embedded files gracefully (linkToCachedMetadata returns empty headings)", () => {
      const mockMetadataCache = {
        getFirstLinkpathDest: vi.fn().mockReturnValue(null),
        getCache: vi.fn(),
      } as unknown as MetadataCache;

      const embeds = [
        { link: "nonexistent.md", original: "![[nonexistent.md]]", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
      ] as any;

      const result = getEmbeddedHeadings(mockMetadataCache, embeds);

      expect(result).toEqual({
        "![[nonexistent.md]]": []
      });
      expect(mockMetadataCache.getFirstLinkpathDest).toHaveBeenCalledWith("nonexistent.md", undefined);
      expect(mockMetadataCache.getCache).not.toHaveBeenCalled();
    });

    it("should handle undefined/null cache.headings in embedded files gracefully", () => {
      const mockMetadataCache = {
        getFirstLinkpathDest: vi.fn().mockReturnValue({ path: "test.md" }),
        getCache: vi.fn().mockReturnValue({ headings: null }),
      } as unknown as MetadataCache;

      const embeds = [
        { link: "test.md", original: "![[test.md]]", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
      ] as any;

      const result = getEmbeddedHeadings(mockMetadataCache, embeds);

      expect(result).toEqual({
        "![[test.md]]": []
      });
    });

    it("should filter out invalid headings in embedded files (null or missing heading property)", () => {
      const mockMetadataCache = {
        getFirstLinkpathDest: vi.fn().mockReturnValue({ path: "test.md" }),
        getCache: vi.fn().mockReturnValue({
          headings: [
            { heading: "valid", level: 1, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } },
            null,
            { level: 2, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }, // missing heading property
            { heading: "another valid", level: 3, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } },
          ]
        }),
      } as unknown as MetadataCache;

      const embeds = [
        { link: "test.md", original: "![[test.md]]", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
      ] as any;

      const result = getEmbeddedHeadings(mockMetadataCache, embeds);

      expect(result).toEqual({
        "![[test.md]]": [
          { heading: "valid", level: 1, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } },
          { heading: "another valid", level: 3, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } },
        ]
      });
    });

    it("should return undefined when embeds is null", () => {
      const mockMetadataCache = {} as MetadataCache;

      const result = getEmbeddedHeadings(mockMetadataCache, null);

      expect(result).toBeUndefined();
    });
  });

  describe("mergeHeadings - destructEmbHC null safety", () => {
    it("should not throw TypeError when processing headings with null values", () => {
      const headings = [
        { heading: "![[test.md]]", level: 1, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
      ];

      const embeddedHeadings = {
        "![[test.md]]": [
          { heading: null as any, level: 2, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
        ]
      };

      // The key test is that this doesn't throw a TypeError
      expect(() => mergeHeadings(headings, embeddedHeadings)).not.toThrow();
    });

    it("should not throw TypeError when processing headings with undefined values", () => {
      const headings = [
        { heading: "![[test.md]]", level: 1, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
      ];

      const embeddedHeadings = {
        "![[test.md]]": [
          { heading: undefined as any, level: 2, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }
        ]
      };

      // The key test is that this doesn't throw a TypeError
      expect(() => mergeHeadings(headings, embeddedHeadings)).not.toThrow();
    });
  });
})