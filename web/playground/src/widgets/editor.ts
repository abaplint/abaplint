import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget, DockPanel} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";
import {PrettyPrinter} from "abaplint/abap/pretty_printer";
import {HelpWidget} from "./help";

export class EditorWidget extends Widget {
  private editor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;
  private filename: string;
  private contents: string;

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor(filename: string, contents: string) {
    super({node: EditorWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("editor");
    this.title.label = filename;
    this.title.closable = true;
    this.title.caption = this.title.label;
    this.filename = filename;
    this.contents = contents;
  }

  get inputNode(): HTMLInputElement {
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
    if (this.filename !== "abaplint.json") { // todo, hmm
      FileSystem.updateFile(this.filename, this.editor!.getValue());
      this.updateMarkers();
    }
  }

  protected updateMarkers() {
    const issues = FileSystem.getIssues(this.filename);

    const markers: monaco.editor.IMarkerData[] = [];
    for (const i of issues) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: i.getMessage(),
        startLineNumber: i.getStart().getRow(),
        startColumn: i.getStart().getCol(),
        endLineNumber: i.getEnd().getRow(),
        endColumn: i.getEnd().getCol(),
      });
    }

    monaco.editor.setModelMarkers(this.editor!.getModel()!, "abaplint", markers);
  }

  protected prettyPrint() {
    const file = FileSystem.getRegistry().getABAPFile(this.filename);
    if (file === undefined) {
      return;
    }
    const old = this.editor!.getPosition();
    this.editor!.setValue(new PrettyPrinter(file).run());
    this.editor!.setPosition(old!);
  }

  protected openHelp() {
    const dock = this.parent as DockPanel;
    let help: HelpWidget | undefined;

// only add one, todo, refactor, this is a mess
    const it = dock.children();
    for (;;) {
      const res = it.next();
      if (res === undefined) {
        break;
      } else if (res instanceof HelpWidget) {
        help = res;
        break;
      }
    }

    if (help === undefined) {
      help = new HelpWidget();
      dock.addWidget(help, {mode: "split-right", ref: this});
    }

    help.updateIt(this.filename, this.editor!.getPosition()!);
  }

  protected onAfterAttach() {
    if (this.editor === undefined) {
      this.editor = monaco.editor.create(this.node, {
        value: this.contents,
        language: this.determineLanguage(this.filename),
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

// todo, how to show custom commands in the command palette?
      this.editor.addCommand(monaco.KeyMod.Shift + monaco.KeyCode.F1, this.prettyPrint.bind(this));
      this.editor.addCommand(monaco.KeyCode.F1, this.openHelp.bind(this));

      this.editor.addCommand(
        monaco.KeyMod.CtrlCmd + monaco.KeyMod.Shift + monaco.KeyCode.KEY_P,
        () => { this.editor!.trigger("", "editor.action.quickCommand", ""); });

// override Chrome default shortcuts
      this.editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.KEY_S, () => { return undefined; });
      this.editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.KEY_P, () => { return undefined; });

      this.updateMarkers();

      if (this.filename === "zfoobar.prog.abap") { // todo, hack
        this.editor.focus();
      }
    }
  }
}