import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {Registry} from "../registry";
import {Scope} from "../abap/syntax/_scope";
import {Token} from "../abap/tokens/_token";
import {Statement} from "../abap/statements/_statement";
import {StatementNode} from "../abap/nodes";
import {Identifier} from "../abap/types/_identifier";
import {FormDefinition} from "../abap/types";
import {ABAPFile} from "../files";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/syntax/syntax";
import {ITextDocumentPositionParams} from ".";

export interface ICursorPosition {
  token: Token;
  statement: Statement;
  identifier: Identifier;
  snode: StatementNode;
}

export class LSPUtils {

  public static findCursor(reg: Registry, pos: ITextDocumentPositionParams): ICursorPosition | undefined {
    const file = reg.getABAPFile(pos.textDocument.uri);
    if (file === undefined) {
      return undefined;
    }

    const line = pos.position.line;
    const character = pos.position.character;

    for (const statement of file.getStatements()) {
      for (const token of statement.getTokens()) {
// assumption: no tokens span multiple lines
        if (token.getRow() - 1 === line
            && token.getCol() - 1 <= character
            && token.getCol() - 1 + token.getStr().length > character) {
          return {
            token: token,
            identifier: new Identifier(token, file.getFilename()),
            statement: statement.get(),
            snode: statement};
        }
      }
    }

    return undefined;
  }

  public static lookup(cursor: ICursorPosition, reg: Registry, obj: ABAPObject):
      ABAPFile | FormDefinition | Identifier | undefined {

    const res = this.findInclude(cursor, reg);
    if (res) { return res; }

    const scope = new SyntaxLogic(reg, obj).traverseUntil(cursor.identifier);

    const form = this.findForm(cursor, scope);
    if (form) { return form; }

    const resolved = scope.resolveVariable(cursor.token.getStr());
    if (resolved instanceof Identifier) {
      return resolved;
    }

    return undefined;
  }

  public static findForm(found: ICursorPosition, scope: Scope): FormDefinition | undefined {
    if (!(found.statement instanceof Statements.Perform)) {
      return undefined;
    }

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
    if (resolved) {
      return resolved;
    }

    return undefined;
  }

  public static findInclude(found: ICursorPosition, reg: Registry): ABAPFile | undefined {
    if (!(found.statement instanceof Statements.Include)) {
      return;
    }

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
      return obj.getABAPFiles()[0];
    }

    return undefined;
  }

}