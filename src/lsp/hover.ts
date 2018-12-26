import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";

export class Hover {
  public static find(_reg: Registry, _params: LServer.TextDocumentPositionParams): LServer.Hover | undefined {
    return undefined;
  }
}