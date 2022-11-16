import { HeadingCache } from "obsidian";
// TODO refactor this
export class Heading {
  constructor(private cached: HeadingCache) {}

  get level(): number {
    return this.cached.level;
  }

  get rawHeading(): string {
    return this.cached.heading;
  }
  get isLink(): boolean {
    const h = this.cached.heading

    const isLnk = linkReg.test(h)
    const isManyLnk = manylinkReg.test(h)
    return  isLnk && !isManyLnk;
  }
  get href(): string | null {
    if (!this.isLink) return null;
    const value = parseMarkdownLink(this.rawHeading)
    return `#${rmPipe(value)}`;
  }
  get markdownHref(): string | null {
    if (!this.isLink) return hd(rmBrckt(this.rawHeading));
    const value = parseMarkdownLink(this.rawHeading);
    if (!hasAlias(value)) return hd(value);

    // The way obsidian needs to render the link is to have the link be
    // the header + alias such as [[#Something Alt Text]]
    // Then we need to append the actual alias
    const part = value.split("|")[1];
    const link = rmPipe(value);
    return hd(`${link}|${part}`);
  }

}

const linkReg = /^\!?\[\[(.*?)\]\]$/;
const manylinkReg = /\]\](.*?)\[\[/;

function hd(txt:string){
  return `[[#${txt}]]`
}

function parseMarkdownLink(link: string): string {
  const [, base] = link.match(linkReg) || [];
  return base;
}

function rmBrckt(s: string) {
  return s
    .replace(/\[\[/g, '')
    .replace(/\]\]/g, '');
}

function rmPipe(s: string){
  return s.replace("|", " ");
}

function hasAlias(s: string){
  return s.includes("|");
}