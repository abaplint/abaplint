import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from ".";
import {LSPUtils} from "./_lsp_utils";
import {Registry} from "..";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";

export class Rename {
  private readonly reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  public prepareRename(params: ITextDocumentPositionParams): {range: LServer.Range, placeholder: string} | undefined {
    const cursor = LSPUtils.findCursor(this.reg, params);
    if (cursor === undefined) {
      return undefined;
    }

    const start = cursor.token.getStart();
    const end = cursor.token.getEnd();

    if (cursor.stack.length === 2
        && cursor.stack[0].get() instanceof Statements.ClassDefinition
        && cursor.stack[1].get() instanceof Expressions.ClassName) {
      const range = LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);
      return {
        range: range,
        placeholder: cursor.token.getStr(),
      };
    }

    return undefined;
  }

  public rename(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    if (this.prepareRename(params) === undefined) {
      return undefined;
    }

// todo

    return undefined;
  }

}