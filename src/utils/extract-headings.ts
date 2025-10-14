import { CachedMetadata, MetadataCache, parseLinktext,HeadingCache, EmbedCache } from "obsidian";
import { Heading } from "../models/heading";
import { TableOptions, EmbeddedHeadings } from "../types";
import "./util";

export function extractHeadings(
  fileMetaData: CachedMetadata,
  options: TableOptions
) {
  const { headings } = fileMetaData || {};

  const processableHeadings = (headings || [])
                                .filter(isProcessable(options))
                                .map((h) => new Heading(h));  

  return buildMarkdown(processableHeadings,options);
}

function buildMarkdown(headings:Heading[], options: TableOptions){
  return  (!headings.length)           ? ""
        : (options.style === "inline") ? buildInlineMarkdownText(headings, options)
        :                                buildMarkdownText(headings, options);
}

function isProcessable (options:TableOptions){
  return (h: HeadingCache) => 
            !!h 
            && h.level >= options.min_depth 
            && h.level <= options.max_depth
}

export function getEmbeddedHeadings(metadataCache: MetadataCache, embeds:EmbedCache[]) : EmbeddedHeadings | undefined {
  if (!embeds) return undefined
  
  const grabEmbeddedHeadings = (agg:{}, e:EmbedCache) => {
    const embeddedHeadings = linkToCachedMetadata(e.link, metadataCache).headings;
    return {...agg, [e.original]: embeddedHeadings };
  }

  //[e1,e2,...] -> {e1.original: e1.headings, ...}
  return embeds
    .reduce(grabEmbeddedHeadings,{} ) ;
}

function destructEmbHC({ heading }: HeadingCache) {
  if (!heading) return ''
  if (!heading.startsWith("!")) return heading
  const inner = heading
    .split(/\!\[\[(.*?)\]\]/)
    .filter(Boolean)[0]
    .split("#")

  return inner[1] || inner[0];
}

export function mergeHeadings(headings_:HeadingCache[] | undefined, embeddedHeadings:EmbeddedHeadings | undefined) : CachedMetadata {
  const insertHeadings = (h: HeadingCache) => {
    const hs = (embeddedHeadings && embeddedHeadings[h.heading]) || []
    const hpart = destructEmbHC(h);
    const hpartlevel = hs.find((hc: HeadingCache) => hc.heading === hpart)?.level || -1;
    // Process embedded headings: drop initial headings that don't match the part or are below the part level,
    // then take headings while they match the part or are deeper, filter out level 1, and adjust levels
    const eheadings = hs
      // Drop headings until finding the matching part or if no match level
      .dropWhile((hc: HeadingCache) => hpartlevel !== -1 && hc.heading !== hpart)
      // Take headings that match the part or are deeper than the part level
      .takeWhile((hc: HeadingCache) => hc.heading === hpart || hc.level > hpartlevel)
      // Exclude top-level headings (level 1)
      .filter((hc: HeadingCache) => hc.level > 1)
      // Adjust heading levels relative to the parent heading's level
      .map(tweakOffset(h.level));
    return [h, ...eheadings];
  };
  const headings =  headings_?.flatMap(insertHeadings) || [];
  return { headings };
}

function tweakOffset(offset: number)  {
  return (h: HeadingCache) => ({ ...h, level: h.level + offset - 1 });
}

function linkToCachedMetadata(link:string, metadataCache: MetadataCache): CachedMetadata {
  const {path,subpath}= parseLinktext(link)
  const f = metadataCache.getFirstLinkpathDest(path,subpath)
  const cache = f && metadataCache.getCache(f.path)
  return cache ? { ...cache, headings: cache.headings.filter(h => h && h.heading) } : { headings: [] }
}

function getIndicator(
  heading: Heading,
  firstLevel: number,
  options: TableOptions
) {
  const defaultIndicator = options.style === "number" ? "1." : "-";
  const reversedIndicator = options.style === "number" ? "-" : "1.";

  return    !options.varied_style         ? defaultIndicator
          // if the heading is at the same level as the first heading and varied_style is true, 
          // then only set the first indicator to the selected style
          : heading.level === firstLevel  ? defaultIndicator
          : reversedIndicator;
}

/**
 * Generate markdown for a standard table of contents
 * @param headings - Array of heading instances
 * @param options - Code block options
 * @returns
 */
function buildMarkdownText(headings: Heading[], options: TableOptions): string {
  const headerString_ =  headerString(headings[0].level, options);
  const list: string[] = options.title ? [`${options.title}`] : []

  const [hss,_]= headings.reduce(headerString_, [[], 0] )
  return [...list,...hss].join("\n");
  
}

function headerString(depth:number, options: TableOptions){
  return ([hs, indent_] :[string[], number], heading: Heading): [string[], number] => {
    const itemIndication = getIndicator(heading, depth, options);
    const { whiteSpace, indent } = calculateIndent(heading, depth, indent_ , options);

    const s = `${whiteSpace}${itemIndication} ${heading.markdownHref}`;
    return [[...hs, s], indent];
  }
}

function calculateIndent(heading: Heading, firstHeadingDepth: number, indent_: number, options: TableOptions) {
  const a_i_h = options.allow_inconsistent_headings;

  const l = Math.max(0, heading.level - firstHeadingDepth);
  const l2 = a_i_h && (l - indent_ > 1) ? indent_ + 1 : l;

  const indent = a_i_h ? l : indent_
  const whiteSpace = new Array(l2).fill("\t").join("");
  return { indent, whiteSpace };
}

/**
 * Generate the markdown for the inline style
 * @param headings - Array of heading instances
 * @param options - Code block options
 * @returns
 */
function buildInlineMarkdownText(headings: Heading[], options: TableOptions) {
  const levels = headings.map(h => h.level);
  const highestDepth = Math.min(...levels);
  const delimiter = options.delimiter || "|";

  return headings
    // all headings at the same level as the highest depth
    .filter(h => h.level === highestDepth)
    .map(h => `${h.markdownHref}`)
    .join(` ${delimiter.trim()} `);
}
