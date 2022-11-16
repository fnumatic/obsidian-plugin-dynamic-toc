import { HeadingCache } from "obsidian";
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
});
