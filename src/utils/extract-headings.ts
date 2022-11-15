import { CachedMetadata, MetadataCache, parseLinktext,HeadingCache, EmbedCache } from "obsidian";
import { Heading } from "../models/heading";
import { TableOptions } from "../types";

export type EmbeddedHeadings = {[key:string]:HeadingCache[]}

export function extractHeadings(
  fileMetaData: CachedMetadata,
  options: TableOptions
) {
  if (!fileMetaData?.headings) return "";
  const { headings } = fileMetaData;
  const processableHeadings = headings.filter(
    (h) => !!h && h.level >= options.min_depth && h.level <= options.max_depth
  );
  if (!processableHeadings.length) return "";

  const headingInstances = processableHeadings.map((h) => new Heading(h));
  if (options.style === "inline") {
    return buildInlineMarkdownText(headingInstances, options);
  }

  return buildMarkdownText(headingInstances, options);
}

export function processableHeadings (options:TableOptions, headings:HeadingCache[]){
  return headings.filter(
    (h) => !!h && h.level >= options.min_depth && h.level <= options.max_depth
  );
}

export function embeddedHeadings(metadataCache: MetadataCache, embeds:EmbedCache[]) : EmbeddedHeadings {
  if (!embeds) return undefined
  
  const grabEmbeddedHeadings = (agg:{}, e:EmbedCache) => {
    const embeddedHeadings = linkToCachedMetadata(e.link, metadataCache).headings;
    return {...agg, [e.original]: embeddedHeadings };
  }

  //[e1,e2,...] -> {e1.original: e1.headings, ...}
  return embeds
    .reduce(grabEmbeddedHeadings,{} ) ;
}

export function mergeHeadings(headings:HeadingCache[], embeddedHeadings:EmbeddedHeadings) {
  console.log(mergeHeadings.name, embeddedHeadings);
  
  const insertHeadings = (h: HeadingCache): HeadingCache []=> {
    const offset = h.level;
    const eheadings = embeddedHeadings[h.heading]
                      ?.filter((h:HeadingCache) => h.level > 1)
                      .map(tweakOffset(offset));
                      console.log(eheadings);
                      
    return (eheadings) ? [h, ...eheadings] : [h];
  };
  
  const patchedHeadings = headings.flatMap(insertHeadings);
  console.log(mergeHeadings.name, patchedHeadings);

  return {headings:patchedHeadings} as CachedMetadata;
}

function tweakOffset(offset: number)  {
  return (h: HeadingCache) => ({ ...h, level: h.level + offset - 1 } as HeadingCache);
}

function linkToCachedMetadata(link:string, metadataCache: MetadataCache) {
  const {path,subpath}= parseLinktext(link)
  const f = metadataCache.getFirstLinkpathDest(path,subpath)
  return metadataCache.getCache(f.path)
}

function getIndicator(
  heading: Heading,
  firstLevel: number,
  options: TableOptions
) {
  const defaultIndicator = (options.style === "number" && "1.") || "-";
  if (!options.varied_style) return defaultIndicator;
  // if the heading is at the same level as the first heading and varied_style is true, then only set the first indicator to the selected style
  if (heading.level === firstLevel) return defaultIndicator;
  return options.style === "number" ? "-" : "1.";
}

/**
 * Generate markdown for a standard table of contents
 * @param headings - Array of heading instances
 * @param options - Code block options
 * @returns
 */
function buildMarkdownText(headings: Heading[], options: TableOptions): string {
  const firstHeadingDepth = headings[0].level;
  const list: string[] = [];
  if (options.title) {
    list.push(`${options.title}`);
  }

  let previousIndent = 0;
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];

    const itemIndication = getIndicator(heading, firstHeadingDepth, options);
    let numIndents = new Array(Math.max(0, heading.level - firstHeadingDepth));

    if (options.allow_inconsistent_headings) {
      if (numIndents.length - previousIndent > 1) {
        numIndents = new Array(previousIndent + 1);
      }
      previousIndent = numIndents.length;
    }

    const indent = numIndents.fill("\t").join("");
    list.push(`${indent}${itemIndication} ${heading.markdownHref}`);
  }
  return list.join("\n");
}

/**
 * Generate the markdown for the inline style
 * @param headings - Array of heading instances
 * @param options - Code block options
 * @returns
 */
function buildInlineMarkdownText(headings: Heading[], options: TableOptions) {
  const highestDepth = headings
    .map((h) => h.level)
    .reduce((a, b) => Math.min(a, b));
  // all headings at the same level as the highest depth
  const topLevelHeadings = headings.filter(
    (heading) => heading.level === highestDepth
  );
  const delimiter = options.delimiter ? options.delimiter : "|";
  return topLevelHeadings
    .map((heading) => `${heading.markdownHref}`)
    .join(` ${delimiter.trim()} `);
}
