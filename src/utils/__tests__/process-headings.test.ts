import { CachedMetadata } from "obsidian";
import { DynamicTOCSettings, TableOptions } from "src/types";
import { extractHeadings } from "../extract-headings";

describe("Extract headings", () => {
  it("should match snapshot", () => {
    const fileMetaData = {
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
      ],
    } as CachedMetadata;
    const options = {
      max_depth: 4,
      min_depth: 1,
      style: "number",
    } as TableOptions;
    expect(
      extractHeadings(fileMetaData, options, {
        useNewHeaderExtraction: true,
      } as DynamicTOCSettings)
    ).toMatchSnapshot();
  });
});
