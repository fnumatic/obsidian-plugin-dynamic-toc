import { syntaxTree } from "@codemirror/language";
import {
  RangeSetBuilder,
  StateField,
  Transaction,
  EditorSelection,
  EditorState,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
} from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { App, editorLivePreviewField,   } from "obsidian";
import { DynamicTOCSettings } from "src/types";
import { embeddedHeadings, extractHeadings, mergeHeadings } from "src/utils/extract-headings";
import {TocWidget} from "./toc"

export const tocField= (app: App,settings: DynamicTOCSettings) =>{
 return StateField.define<DecorationSet>({
  
  create:(state:EditorState) => renderInline(app, state, state.selection ,settings) ?? Decoration.none,

  update(oldState: DecorationSet, tr: Transaction): DecorationSet {
    if(! tr.state.field(editorLivePreviewField)) return Decoration.none
    return renderInline(app, tr.state, tr.selection, settings) ?? Decoration.none 
  },

  provide: f => EditorView.decorations.from(f) 
});
}


function renderInline(app: App, state: EditorState, selection:EditorSelection, settings: DynamicTOCSettings) {
  const builder = new RangeSetBuilder<Decoration>();
	const currentFile = app?.workspace.getActiveFile();
	    if (!currentFile) return Decoration.none;
	    syntaxTree(state).iterate({
	      enter(node) {
	        const [start,end] = [node.from -1, node.to +1];
	        if (selection && selectionAndRangeOverlap(selection, start, end)) return 
	        if (!node.type.name.startsWith("hmd-barelink_link")) return
	        if (nodeText(state, node) !== "TOC") return
	        
	        const fileMetaData = app.metadataCache.getCache(currentFile.path)
          
          const { headings, embeds } = fileMetaData;
          const embbedHeadings = embeddedHeadings(this.app.metadataCache, embeds)
          
          const mergedMetaData = settings.embeddedHeadings && embbedHeadings 
            ? mergeHeadings(headings, embbedHeadings ) 
            : fileMetaData;

          const headings_ = extractHeadings(
	          mergedMetaData,
	          settings
	        );
	        
         builder.add(
	          start,
	          end,
	          Decoration.replace({
	            widget: new TocWidget(app, headings_,currentFile.path,node.from),
	            block: true,
	          })
	        );
	      },
        
	    });
	
	    return builder.finish();
}

function nodeText(state:EditorState, node:SyntaxNodeRef) {
  //@ts-ignore
  return state.doc.slice(node.from, node.to).text[0];
}

function selectionAndRangeOverlap(selection: EditorSelection, rangeFrom: number, rangeTo: number) {
  for (const range of selection.ranges) {
      if (range.from <= rangeTo && range.to >= rangeFrom) {
          return true;
      }
  }

  return false;
}
