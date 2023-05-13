import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";

export class CodeLens {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public list(textDocument: LServer.TextDocumentIdentifier): LServer.CodeLens[] {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }
// todo
    return [];
  }

}