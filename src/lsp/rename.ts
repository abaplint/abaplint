import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from ".";

export class Rename {

  public static prepareRename(_params: ITextDocumentPositionParams): {range: LServer.Range, placeholder: string} | undefined {
    return undefined;
  }

  public static rename(_params: IRenameParams): LServer.WorkspaceEdit | undefined {
    return undefined;
  }

}