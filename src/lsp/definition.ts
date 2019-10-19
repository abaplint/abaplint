import * as LServer from "vscode-languageserver-types";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {Registry} from "../registry";
import {SyntaxLogic} from "../abap/syntax/syntax";
import {Identifier} from "../abap/types/_identifier";
import {Scope} from "../abap/syntax/_scope";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils, IFindResult} from "./_lsp_utils";

export class Definition {

  public static find(reg: Registry,
                     doc: LServer.TextDocumentIdentifier,
                     position: LServer.Position): LServer.Location | undefined {

    const file = reg.getABAPFile(doc.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.find(reg, doc, position);
    if (found === undefined) {
      return undefined;
    }

    if (found.statement instanceof Statements.Include) {
      const res = this.findInclude(found, reg);
      if (res) {
        return res;
      }
    }

    const scope = new SyntaxLogic(reg, obj).traverseUntil(found.identifier);

    if (found.statement instanceof Statements.Perform) {
      const res = this.findForm(found, scope);
      if (res) {
        return res;
      }
    }

    const resolved = scope.resolveVariable(found.token.getStr());
    if (resolved instanceof Identifier) {
      return this.buildResult(resolved);
    }

    return undefined;
  }

  private static buildResult(resolved: Identifier): LServer.Location {
    const pos = resolved.getStart();
    return {
      uri: resolved.getFilename(),
      range: LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1),
    };
  }

  private static findForm(found: IFindResult, scope: Scope): LServer.Location | undefined {
    const name = found.snode.findFirstExpression(Expressions.FormName);
    if (name === undefined) {
      return undefined;
    }

// check the cursor is at the right token
    const token = name.getFirstToken();
    if (token.getStart().getCol() !== found.token.getStart().getCol()
        || token.getStart().getRow() !== found.token.getStart().getRow()) {
      return undefined;
    }

    const resolved = scope.findFormDefinition(found.token.getStr());
    if (resolved instanceof Identifier) {
      return this.buildResult(resolved);
    }

    return undefined;
  }

  private static findInclude(found: IFindResult, reg: Registry): LServer.Location | undefined {
    const name = found.snode.findFirstExpression(Expressions.IncludeName);
    if (name === undefined) {
      return undefined;
    }

// check the cursor is at the right token
    const token = name.getFirstToken();
    if (token.getStart().getCol() !== found.token.getStart().getCol()
        || token.getStart().getRow() !== found.token.getStart().getRow()) {
      return undefined;
    }

    const obj = reg.getObject("PROG", token.getStr()) as ABAPObject | undefined;
    if (obj) {
      const filename = obj.getABAPFiles()[0].getFilename();

      return {
        uri: filename,
        range: LServer.Range.create(0, 0, 0, 0),
      };
    }

    return undefined;
  }

}