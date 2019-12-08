import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from ".";
import {Registry} from "..";

export class Rename {
//  private readonly reg: Registry;

  constructor(_reg: Registry) {
//    this.reg = reg;
  }

  public prepareRename(_params: ITextDocumentPositionParams): {range: LServer.Range, placeholder: string} | undefined {
    return undefined;
  }

  public rename(_params: IRenameParams): LServer.WorkspaceEdit | undefined {
    return undefined;
  }

}