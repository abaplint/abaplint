import * as LServer from "vscode-languageserver-types";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../files";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IFormDefinition} from "../abap/types/_form_definition";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ICursorPosition} from "./_lsp_utils";
import {Identifier} from "../abap/4_file_information/_identifier";
import {FormDefinition} from "../abap/types";
import {TypedIdentifier} from "../abap/types/_typed_identifier";

export interface LSPLookupResult {
  hover: string | undefined;         // in markdown
  definition: LServer.Location | undefined // used for go to definition
}

export class LSPLookup {

  public static lookup(cursor: ICursorPosition, reg: IRegistry, obj: ABAPObject): LSPLookupResult | undefined {

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
      return {hover: "Call FORM", definition: this.buildResult(form)};
    }

    const lookup = scope.findVariable(cursor.token.getStr());

    if (lookup instanceof FormDefinition) {
      return {hover: "FORM definition", definition: undefined};
    } else if (lookup instanceof TypedIdentifier) {
      let value = "Resolved, Typed\n\nType: " + lookup.getType().toText(0);
      if (lookup.getValue()) {
        value = value + "Value:\n\n```" + lookup.getValue() + "```";
      }
      if (lookup.getMeta().length > 0) {
        value = value + "Meta: " + lookup.getMeta().join(", ");
      }
      return {hover: value, definition: this.buildResult(lookup)};
    } else {
      return {hover: "Unknown", definition: undefined};
    }
  }

////////////////////////////////////////////

  private static buildResult(resolved: Identifier): LServer.Location {
    const pos = resolved.getStart();
    return {
      uri: resolved.getFilename(),
      range: LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1),
    };
  }

  private static ABAPFileResult(abap: ABAPFile): LServer.Location {
    return {
      uri: abap.getFilename(),
      range: LServer.Range.create(0, 0, 0, 0),
    };
  }

  private static findForm(found: ICursorPosition, scope: ISpaghettiScopeNode): IFormDefinition | undefined {
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

  private static findInclude(found: ICursorPosition, reg: IRegistry): ABAPFile | undefined {
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