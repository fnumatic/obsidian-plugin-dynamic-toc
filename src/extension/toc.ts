import { EditorView, WidgetType } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { App, MarkdownRenderer, setIcon } from "obsidian";


export class TocWidget extends WidgetType {
    constructor(
        private app:App,
        private data:string,
        private path:string,
        private selection:number
    ){
      super();
    }
  toDOM(view: EditorView): HTMLElement {
    
    var div3= createDiv({
        cls: ["edit-block-button"],
    },
    (el) => {
      setIcon(el,"lucide-code-2")
      el.addEventListener('click',
      () => view.dispatch({
        selection: EditorSelection.create([EditorSelection.cursor(this.selection)]) 
      }))
    }
    );
    return createDiv({
        cls: ["cm-preview-code-block", "cm-embed-block", "markdown-rendered"] 
    },
    (el) =>{
        el.appendChild(div3)
        MarkdownRenderer.render(this.app, this.data,el,this.path,null)
    });
  }
}
