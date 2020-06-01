import * as LServer from "vscode-languageserver-types";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../files";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IFormDefinition} from "../abap/types/_form_definition";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ICursorData, LSPUtils} from "./_lsp_utils";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Identifier} from "../abap/4_file_information/_identifier";

export interface LSPLookupResult {
  hover: string | undefined;               // in markdown
  definition: LServer.Location | undefined // used for go to definition
  definitionId?: Identifier
}

export class LSPLookup {

  public static lookup(cursor: ICursorData, reg: IRegistry, obj: ABAPObject): LSPLookupResult | undefined {
    const inc = this.findInclude(cursor, reg);
    if (inc) {
      return {hover: "File", definition: this.ABAPFileResult(inc)};
    }

    const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(cursor.identifier.getStart(), cursor.identifier.getFilename());
    if (scope === undefined) {
      return undefined;
    }

    const form = this.findForm(cursor, scope);
    if (form) {
      return {hover: "Call FORM", definition: LSPUtils.identiferToLocation(form)};
    }

    const variable = scope.findVariable(cursor.token.getStr());
    if (variable instanceof TypedIdentifier) {
      let value = "Resolved variable, Typed\n\nType: " + variable.getType().toText(0);
      if (variable.getValue()) {
        value = value + "\n\nValue: ```" + variable.getValue() + "```";
      }
      if (variable.getMeta().length > 0) {
        value = value + "\n\nMeta: " + variable.getMeta().join(", ");
      }
      const location = LSPUtils.identiferToLocation(variable);
      return {hover: value, definition: location, definitionId: variable};
    }

    const type = scope.findType(cursor.token.getStr());
    if (type instanceof TypedIdentifier) {
      const value = "Resolved type";
      return {hover: value, definition: undefined};
    }

    return undefined;
  }

////////////////////////////////////////////

  private static ABAPFileResult(abap: ABAPFile): LServer.Location {
    return {
      uri: abap.getFilename(),
      range: LServer.Range.create(0, 0, 0, 0),
    };
  }

  private static findForm(found: ICursorData, scope: ISpaghettiScopeNode): IFormDefinition | undefined {
    if (!(found.snode.get() instanceof Statements.Perform)) {
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

  private static findInclude(found: ICursorData, reg: IRegistry): ABAPFile | undefined {
    if (!(found.snode.get() instanceof Statements.Include)) {
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