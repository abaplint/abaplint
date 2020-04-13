import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";
import {HelpWidget} from "./help";
import {LanguageServer} from "abaplint/lsp/language_server";
import {HighlightActions} from "../highlight_actions";

export class EditorWidget extends Widget {
  private editor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;
  private readonly model: monaco.editor.ITextModel;

  public static createNode(): HTMLElement {
    return document.createElement("div");
  }

  public constructor(filename: string, contents: string) {
    super({node: EditorWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("editor");
    this.title.label = monaco.Uri.parse(filename).path;
    this.title.closable = false;
    this.title.caption = this.title.label;

    this.model = monaco.editor.createModel(
      contents,
      this.determineLanguage(filename),
      monaco.Uri.parse(filename),
    );
  }

  public getModel(): monaco.editor.ITextModel {
    return this.model;
  }

  public onCloseRequest(msg: Message) {
    super.onCloseRequest(msg);
    this.editor!.dispose();
    this.model.dispose();
  }

  public get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
  }

  protected onResize() {
    if (this.editor) {
      this.editor.layout();
    }
  }

  protected onActivateRequest(msg: Message): void {
    if (this.editor) {
      this.editor.focus();
    }
  }

  protected determineLanguage(filename: string): string {
    const split = filename.split(".");
    return split[split.length - 1];
  }

  protected changed(e: any) {
    FileSystem.updateFile(this.model.uri.toString(), this.editor!.getValue());
    this.updateMarkers();
  }

  public updateMarkers() {
// see https://github.com/microsoft/monaco-editor/issues/1604

    const ls = new LanguageServer(FileSystem.getRegistry());
    const diagnostics = ls.diagnostics({uri: this.model.uri.toString()});

    const markers: monaco.editor.IMarkerData[] = [];
    for (const diagnostic of diagnostics) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: diagnostic.message,
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
      });
    }

    monaco.editor.setModelMarkers(this.editor!.getModel()!, "abaplint", markers);
  }

  protected openHelp() {
    const help = HelpWidget.getInstance(this);
    help.updateIt(this.model.uri.toString(), this.editor!.getPosition()!);
  }

  protected onAfterAttach() {
    if (this.editor === undefined) {
      this.editor = monaco.editor.create(this.node, {
        model: this.model,
        theme: "vs-dark",
        lightbulb: {
          enabled: true,
        },
      });

      this.editor.onDidChangeModelContent(this.changed.bind(this));

// hack to remap F1, see https://github.com/microsoft/monaco-editor/issues/649
// @ts-ignore
      this.editor._standaloneKeybindingService._getResolver()._lookupMap.get(
        "editor.action.quickCommand")[0].resolvedKeybinding._parts[0].keyCode = monaco.KeyCode.F3;
// @ts-ignore
      this.editor._standaloneKeybindingService.updateResolver();

      this.editor.addAction({
        id: "abaplint.prettyprint",
        label: "Pretty Print",
        keybindings: [monaco.KeyMod.Shift + monaco.KeyCode.F1],
        run: () => { this.editor!.trigger("", "editor.action.formatDocument", ""); },
      });

      this.editor.addAction({
        id: "abaplint.help",
        label: "ABAP Help",
        keybindings: [monaco.KeyCode.F1],
        precondition: "editorLangId == 'abap'",
        run: this.openHelp.bind(this),
      });

      new HighlightActions(this.editor).register();

      this.editor.addAction({
        id: "abaplint.commandpalette",
        label: "Command Palette",
        keybindings: [monaco.KeyMod.CtrlCmd + monaco.KeyMod.Shift + monaco.KeyCode.KEY_P],
        run: () => { this.editor!.trigger("", "editor.action.quickCommand", ""); },
      });

/* todo, action.quickOpen
https://github.com/microsoft/monaco-editor/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+quickopen
*/

// override Chrome default shortcuts
      this.editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.KEY_S, () => { return undefined; });
      this.editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.KEY_P, () => { return undefined; });

      this.updateMarkers();
      this.activate();
    }
  }
}