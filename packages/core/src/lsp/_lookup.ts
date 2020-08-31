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
import {TypedIdentifier, IdentifierMeta} from "../abap/types/_typed_identifier";
import {Identifier} from "../abap/4_file_information/_identifier";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {IClassDefinition} from "../abap/types/_class_definition";
import {BuiltIn} from "../abap/5_syntax/_builtin";

export interface LSPLookupResult {
  hover: string | undefined;                     // in markdown
  definition?: LServer.Location | undefined;     // used for go to definition
  implementation?: LServer.Location | undefined; // used for go to implementation
  definitionId?: Identifier;
  scope?: ISpaghettiScopeNode;
}

export class LSPLookup {

  public static lookup(cursor: ICursorData, reg: IRegistry, obj: ABAPObject): LSPLookupResult | undefined {
    const inc = this.findInclude(cursor, reg);
    if (inc) {
      const found = this.ABAPFileResult(inc);
      return {hover: "Include", definition: found, implementation: found};
    }
    const bottomScope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(
      cursor.identifier.getStart(),
      cursor.identifier.getFilename());
    if (bottomScope === undefined) {
      return undefined;
    }

    const clas = bottomScope.findClassDefinition(cursor.token.getStr());
    if (clas && clas.getStart().equals(cursor.token.getStart())) {
      const found = LSPUtils.identiferToLocation(clas);
      return {hover: "Class definition, " + cursor.token.getStr(),
        definition: found,
        definitionId: clas,
        implementation: undefined,
        scope: bottomScope};
    }

    const intf = bottomScope.findInterfaceDefinition(cursor.token.getStr());
    if (intf && intf.getStart().equals(cursor.token.getStart())) {
      const found = LSPUtils.identiferToLocation(intf);
      return {hover: "Interface definition, " + cursor.token.getStr(),
        definition: found,
        definitionId: intf,
        implementation: undefined,
        scope: bottomScope};
    }

    const form = this.findPerform(cursor, bottomScope);
    if (form) {
      const found = LSPUtils.identiferToLocation(form);
      return {hover: "Call FORM", definition: found, implementation: found, scope: bottomScope};
    }

    const type = bottomScope.findType(cursor.token.getStr());
    if (type instanceof TypedIdentifier && type.getStart().equals(cursor.token.getStart())) {
      const hover = "Type definition, " + cursor.token.getStr();
      return {hover, definition: undefined, scope: bottomScope};
    }

    const variable = bottomScope.findVariable(cursor.token.getStr());
    if (variable instanceof TypedIdentifier && variable.getStart().equals(cursor.token.getStart())) {
      const hover = "Variable definition\n\n" + this.dumpType(variable);

      let location: LServer.Location | undefined = undefined;
      if (variable.getMeta().includes(IdentifierMeta.BuiltIn) === false) {
        location = LSPUtils.identiferToLocation(variable);
      }
      return {hover, definition: location, implementation: location, definitionId: variable, scope: bottomScope};
    }

    const ref = this.searchReferences(bottomScope, cursor.token);
    if (ref !== undefined) {
      const value = this.referenceHover(ref, bottomScope);
      let definition: LServer.Location | undefined = LSPUtils.identiferToLocation(ref.resolved);
      if (definition.uri === BuiltIn.filename) {
        definition = undefined;
      }
      return {hover: value, definition, definitionId: ref.resolved, scope: bottomScope};
    }

    return undefined;
  }

////////////////////////////////////////////

  private static dumpType(variable: TypedIdentifier): string {
    let value = "Type: " + variable.getType().toText(0);
    if (variable.getValue()) {
      value = value + "\n\nValue: ```" + variable.getValue() + "```";
    }
    if (variable.getMeta().length > 0) {
      value = value + "\n\nMeta: " + variable.getMeta().join(", ");
    }
    if (variable.getType().containsVoid() === true) {
      value = value + "\n\nContains void types";
    }
    if (variable.getType().isGeneric() === true) {
      value = value + "\n\nIs generic type";
    }

    return value;
  }

  private static referenceHover(ref: IReference, scope: ISpaghettiScopeNode): string {
    let ret = "Resolved Reference: " + ref.referenceType + " " + ref.resolved.getName();

    if (ref.referenceType === ReferenceType.MethodReference && ref.extra?.className) {
      ret += "\n\n" + this.hoverMethod(ref.position.getName(), scope.findClassDefinition(ref.extra?.className));
    }

    if (ref.resolved instanceof TypedIdentifier) {
      ret += "\n\n" + this.dumpType(ref.resolved);
    }

    if (ref.extra !== undefined && Object.keys(ref.extra).length > 0) {
      ret += "\n\nExtra: " + JSON.stringify(ref.extra);
    }

    return ret;
  }

  private static hoverMethod(method: string, cdef: IClassDefinition | undefined): string {
    if (cdef === undefined) {
      return "";
    }

    const mdef = cdef.getMethodDefinitions().getByName(method);
    if (mdef === undefined) {
      return "";
    }

    let ret = "";
    for (const p of mdef.getParameters().getImporting()) {
      ret = ret + p.getName() + ": TYPE " + p.getType().toText(0) + "\n\n";
    }
    for (const p of mdef.getParameters().getExporting()) {
      ret = ret + p.getName() + ": TYPE " + p.getType().toText(0) + "\n\n";
    }
    for (const p of mdef.getParameters().getChanging()) {
      ret = ret + p.getName() + ": TYPE " + p.getType().toText(0) + "\n\n";
    }
    const r = mdef.getParameters().getReturning();
    if (r) {
      ret = ret + r.getName() + ": TYPE " + r.getType().toText(0) + "\n\n";
    }

    return ret === "" ? ret : ret + "\n\n";
  }

  private static searchReferences(scope: ISpaghettiScopeNode, token: Token): IReference | undefined {

    for (const r of scope.getData().references) {
      if (r.position.getStart().equals(token.getStart())) {
        return r;
      }
    }

    const parent = scope.getParent();
    if (parent) {
      return this.searchReferences(parent, token);
    }

    return undefined;
  }

  private static ABAPFileResult(abap: ABAPFile): LServer.Location {
    return {
      uri: abap.getFilename(),
      range: LServer.Range.create(0, 0, 0, 0),
    };
  }

  private static findPerform(found: ICursorData, scope: ISpaghettiScopeNode): IFormDefinition | undefined {
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