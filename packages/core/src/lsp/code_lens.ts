import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {MessageClass} from "../objects";

export type CodeLensSettings = {
  messageText: boolean,
};

export class CodeLens {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public list(textDocument: LServer.TextDocumentIdentifier, settings: CodeLensSettings = {messageText: true}): LServer.CodeLens[] {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const obj = this.reg.findObjectForFile(file);
    if (obj === undefined || !(obj instanceof ABAPObject)) {
      return [];
    }
    new SyntaxLogic(this.reg, obj).run();

    const ret: LServer.CodeLens[] = [];

    if (settings.messageText === true) {
      const list = this.reg.getMSAGReferences().listByFilename(file.getFilename());
      for (const l of list) {
        const msag = this.reg.getObject("MSAG", l.messageClass) as MessageClass | undefined;
        if (msag === undefined) {
          continue;
        }
        const text = msag.getByNumber(l.number)?.getMessage();
        if (text === undefined) {
          continue;
        }
        ret.push({
          range: LSPUtils.tokenToRange(l.token),
          command: LServer.Command.create(text, ""),
        });
      }
    }

    return ret;
  }

}