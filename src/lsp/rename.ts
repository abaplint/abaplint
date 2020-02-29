import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {Registry} from "../registry";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {RenameGlobalClass} from "./rename_global_class";

export enum RenameType {
  GlobalClass = 1,
}

export class Rename {
  private readonly reg: Registry;

  public constructor(reg: Registry) {
    this.reg = reg;
  }

  public prepareRename(params: ITextDocumentPositionParams): {range: LServer.Range, placeholder: string, type: RenameType} | undefined {
    const cursor = LSPUtils.findCursor(this.reg, params);
    if (cursor === undefined) {
      return undefined;
    }

    const start = cursor.token.getStart();
    const end = cursor.token.getEnd();

// todo, make this more generic, specify array for matching
    if (cursor.stack.length === 2
        && cursor.stack[0].get() instanceof Statements.ClassDefinition
        && cursor.stack[1].get() instanceof Expressions.ClassName) {
      const range = LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);
      return {
        range: range,
        placeholder: cursor.token.getStr(),
        type: RenameType.GlobalClass,
      };
    }

    return undefined;
  }

  public rename(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    const prepare = this.prepareRename(params);
    if (prepare === undefined) {
      return undefined;
    }

    switch (prepare.type) {
      case RenameType.GlobalClass:
        return new RenameGlobalClass(this.reg).run(prepare.placeholder, params.newName);
      default:
        return undefined;
    }

  }

}