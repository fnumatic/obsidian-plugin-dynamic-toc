import {
  App,
  MarkdownRenderChild,
  MarkdownRenderer,
  TFile,
  WorkspaceLeaf,
} from "obsidian";
import { mergeSettings } from "../utils/config";
import { extractHeadings, embeddedHeadings, mergeHeadings } from "../utils/extract-headings";
import { DynamicTOCSettings, TableOptions } from "../types";
import { TABLE_CLASS_NAME, TABLE_CLASS_NAME_INLINE } from "src/constants";

export class CodeBlockRenderer extends MarkdownRenderChild {
  constructor(
    private app: App,
    private config: TableOptions,
    private filePath: string,
    public container: HTMLElement
  ) {
    super(container);
  }
  async onload() {
    await this.render();
    this.registerEvent(
      this.app.metadataCache.on(
        //@ts-ignore
        "dynamic-toc:settings",
        this.onSettingsChangeHandler
      )
    );
    this.registerEvent(
      this.app.workspace.on(
        "active-leaf-change",
        this.onActiveLeafChangeHandler
      )
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", this.onFileChangeHandler)
    );
  }

  onActiveLeafChangeHandler = (_: WorkspaceLeaf) => {
   const vstate=_.getViewState()
   if (vstate.state?.mode==="source" && ! vstate.state?.source) {
    this.render();
   }
  };

  onSettingsChangeHandler = (settings: DynamicTOCSettings) => {
    this.render(mergeSettings(this.config, settings));
  };
  onFileChangeHandler = (file: TFile) => {
    if (file.deleted || file.path !== this.filePath) return;
    this.render();
  };

  async render(configOverride?: TableOptions) {
    const settings= configOverride || this.config
    const cls= settings.displayInline ? TABLE_CLASS_NAME_INLINE : null
    this.container.empty();
    this.container = this.container.createSpan();
    this.container.classList.add(TABLE_CLASS_NAME,cls);
    
    const fileMetaData = this.app.metadataCache.getCache(this.filePath)
    const { headings, embeds } = fileMetaData;
    const embbedHeadings = embeddedHeadings(this.app.metadataCache, embeds)
    
    const mergedMetaData = settings.embeddedHeadings && embbedHeadings 
      ? mergeHeadings(headings, embbedHeadings ) 
      : fileMetaData;
    
    const headings_ = extractHeadings(
      mergedMetaData,
      configOverride || this.config
    );
    await MarkdownRenderer.render(
      this.app,
      headings_,
      this.container,
      this.filePath,
      this
    );
  }
}


