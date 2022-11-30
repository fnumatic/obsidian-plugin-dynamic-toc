import { App, MarkdownRenderChild, MarkdownRenderer, TFile } from "obsidian";
import { TABLE_CLASS_NAME, TABLE_CLASS_SELECTOR } from "src/constants";
import { DynamicTOCSettings } from "../types";
import { extractHeadings, embeddedHeadings, mergeHeadings } from "../utils/extract-headings";

export class DynamicInjectionRenderer extends MarkdownRenderChild {
  constructor(
    private app: App,
    private settings: DynamicTOCSettings,
    private filePath: string,
    container: HTMLElement,
    private match: HTMLElement
  ) {
    super(container);
  }
  static findMatch(element: HTMLElement, text: string): HTMLElement | null {
    const match =
      Array.from(element.querySelectorAll("p, span, a")).find((el) => {
        return el.textContent.toLowerCase().includes(text.toLowerCase());
      }) || null;
    return match as HTMLElement | null;
  }
  async onload() {
    this.render();
    this.registerEvent(
      this.app.metadataCache.on(
        //@ts-ignore
        "dynamic-toc:settings",
        this.onSettingsChangeHandler
      )
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", this.onFileChangeHandler)
    );
  }

  onSettingsChangeHandler = () => {
    this.render();
  };
  onFileChangeHandler = (file: TFile) => {
    if (file.deleted || file.path !== this.filePath) return;
    this.render();
  };

  async render() {
    const fileMetaData = this.app.metadataCache.getCache(this.filePath)
    const { headings, embeds } = fileMetaData;
    const embbedHeadings = embeddedHeadings(this.app.metadataCache, embeds)
    
  //if (not embeds parsing allowed in options ) return fileMetaData;
    const mergedMetaData = this.settings.embeddedHeadings && embbedHeadings 
      ? mergeHeadings(headings, embbedHeadings ) 
      : fileMetaData;
    
    const headings_ = extractHeadings(
      mergedMetaData,
      this.settings
    );
    const newElement = document.createElement("div");
    newElement.classList.add(TABLE_CLASS_NAME);
    await MarkdownRenderer.renderMarkdown(
      headings_,
      newElement,
      this.filePath,
      this
    );
    // Keep the match in the document as a hook but hide it
    this.match.style.display = "none";
    const existing = this.containerEl.querySelector(TABLE_CLASS_SELECTOR);
    // We need to keep cleaning up after ourselves on settings or file changes
    if (existing) {
      existing.parentNode.removeChild(existing);
    }
    // Attach the table to the parent of the match
    this.match.parentNode.appendChild(newElement);
  }
}
