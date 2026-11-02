/// <reference types="vitest/globals" />

import type { HeadingCache } from "obsidian";
import { Heading } from "../heading";

describe("Heading Model", () => {
  it("should have the correct raw heading", () => {
    const heading = new Heading({ heading: "foo", level: 1 } as HeadingCache);
    expect(heading.rawHeading).toBe("foo");
  });

  describe("Link headings", () => {
    const heading = new Heading({
      heading: "[[foo]]",
      level: 1,
    } as HeadingCache);

    it("should isLink should be true if is link", () => {
      expect(heading.isLink).toBe(true);
    });
    it("should href should be correct", () => {
      expect(heading.href).toBe("#foo");
    });
    it("should markdownHref should be correct", () => {
      expect(heading.markdownHref).toBe("[[#foo]]");
    });

    describe("With alias", () => {
      const heading = new Heading({
        heading: "[[Something|Alt Text]]",
        level: 1,
      } as HeadingCache);

      it("should isLink should be true if is link", () => {
        expect(heading.isLink).toBe(true);
      });
      it("should href should be correct", () => {
        expect(heading.href).toBe("#Something Alt Text");
      });
      it("should markdownHref should be correct", () => {
        expect(heading.markdownHref).toBe("[[#Something Alt Text|Alt Text]]");
      });
    });

    describe("With mixed text and link", () => {
      const heading = new Heading({
        heading: "foo [[bar]]",
        level: 1,
      } as HeadingCache);

      it("isLink should be false", () => {
        expect(heading.isLink).toBeFalsy();
      });
      it("href should be null", () => {
        expect(heading.href).toBeNull();
      });
      it("markdownHref should be correct", () => {
        expect(heading.markdownHref).toBe("[[#foo bar]]");
      });
    });

    describe("With many links", () => {
      const heading = new Heading({
        heading: "[[foo]] [[bar]]",
        level: 1,
      } as HeadingCache);

      it("isLink should be false", () => {
        expect(heading.isLink).toBeFalsy();
      });
      it("href should be null", () => {
        expect(heading.href).toBeNull();
      });
      it("markdownHref should be correct", () => {
        expect(heading.markdownHref).toBe("[[#foo bar]]");
      });
    })
  });

  describe("Markdown link headings", () => {
    const markdownHrefFor = (heading: string) =>
      new Heading({ heading, level: 1 } as HeadingCache).markdownHref;

    it("uses the link text when the heading is only a markdown link", () => {
      expect(markdownHrefFor("[Hruna](https://example.com)")).toBe("[[#Hruna]]");
    });

    it("ignores an anchor inside the markdown link target", () => {
      expect(
        markdownHrefFor("[Hruna](https://5e.tools/adventure.html#idrotf,3)")
      ).toBe("[[#Hruna]]");
    });

    it("keeps text that follows a markdown link", () => {
      expect(
        markdownHrefFor("[Hruna](https://example.com)'s Missing Sled")
      ).toBe("[[#Hruna's Missing Sled]]");
    });

    it("keeps text around a markdown link in the middle", () => {
      expect(markdownHrefFor("foo [bar](https://example.com) baz")).toBe(
        "[[#foo bar baz]]"
      );
    });
  });

  describe("Wikilink headings with surrounding text", () => {
    const markdownHrefFor = (heading: string) =>
      new Heading({ heading, level: 1 } as HeadingCache).markdownHref;

    // Issue #1: a heading that begins with a wikilink lost its section link.
    it("keeps text after a wikilink", () => {
      expect(markdownHrefFor("[[Hruna]]'s Missing Sled")).toBe(
        "[[#Hruna's Missing Sled]]"
      );
    });

    it("uses the alias of a wikilink followed by text", () => {
      expect(markdownHrefFor("[[Hruna|Alias]]'s Missing Sled")).toBe(
        "[[#Alias's Missing Sled]]"
      );
    });
  });
});
