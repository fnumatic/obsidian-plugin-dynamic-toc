import { CachedMetadata,HeadingCache } from "obsidian";
import { TableOptions } from "src/types";
import { extractHeadings, mergeHeadings, EmbeddedHeadings } from "../extract-headings";

jest.mock('obsidian');

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
      expect(extractHeadings(defaultHeadings, options)).toMatchSnapshot();
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