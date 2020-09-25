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
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Class} from "../objects";

export interface LSPLookupResult {
  /** in markdown */
  hover: string | undefined;
  /** used for go to definition */
  definition?: LServer.Location | undefined;
  /** used for go to implementation */
  implementation?: LServer.Location | undefined;
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

    const fm = this.findFunctionModule(cursor);
    if (fm) {
      return {hover: "Function Module " + fm};
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
    if (type !== undefined && type.getStart().equals(cursor.token.getStart())) {
      const found = LSPUtils.identiferToLocation(type);
      const hover = "Type definition, " + cursor.token.getStr() + "\n\n" + this.dumpType(type);
      return {hover, definition: found, definitionId: type, scope: bottomScope};
    }

    const method = this.findMethodDefinition(cursor, bottomScope);
    if (method !== undefined && method.getStart().equals(cursor.token.getStart())) {
      const found = LSPUtils.identiferToLocation(method);
      const hover = "Method definition \"" + method.getName() + "\"";
      return {hover, definition: found, definitionId: method, scope: bottomScope};
    }

    const variable = bottomScope.findVariable(cursor.token.getStr());
    if (variable !== undefined && variable.getStart().equals(cursor.token.getStart())) {
      const hover = "Variable definition\n\n" + this.dumpType(variable);

      let location: LServer.Location | undefined = undefined;
      if (variable.getMeta().includes(IdentifierMeta.BuiltIn) === false) {
        location = LSPUtils.identiferToLocation(variable);
      }
      return {hover, definition: location, implementation: location, definitionId: variable, scope: bottomScope};
    }

    const ref = this.searchReferences(bottomScope, cursor.token);
    if (ref !== undefined) {
      const value = this.referenceHover(ref, bottomScope, reg);
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
    let value = variable.toText() +
      (variable.getTypeName() ? "\n\nTypename: \"" + variable.getTypeName() + "\"" : "") +
      "\n\nType: " + variable.getType().toText(0);
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

  private static referenceHover(ref: IReference, scope: ISpaghettiScopeNode, reg: IRegistry): string {
    let ret = "Resolved Reference: " + ref.referenceType + " ```" + ref.resolved.getName() + "```";

    if (ref.referenceType === ReferenceType.MethodReference && ref.extra?.className) {
      let cdef = scope.findClassDefinition(ref.extra.className);
      if (cdef === undefined) {
        cdef = (reg.getObject("CLAS", ref.extra.className) as Class | undefined)?.getDefinition();
      }
      // todo, interfaces??

      ret += "\n\n" + this.hoverMethod(ref.position.getName(), cdef);
    } else if (ref.resolved instanceof TypedIdentifier) {
      ret += "\n\n" + this.dumpType(ref.resolved);
    }

    if (ref.extra !== undefined && Object.keys(ref.extra).length > 0) {
      ret += "\n\nExtra: " + JSON.stringify(ref.extra);
    }

    return ret;
  }

  private static hoverMethod(method: string, cdef: IClassDefinition | undefined): string {
    if (cdef === undefined) {
      return "class not found";
    }

    const mdef = cdef.getMethodDefinitions().getByName(method);
    if (mdef === undefined) {
      return "method not found in definition";
    }

    let ret = "";
    for (const p of mdef.getParameters().getImporting()) {
      ret = ret + "IMPORTING: " + p.getName() + " TYPE " + p.getType().toText(0) + "\n\n";
    }
    for (const p of mdef.getParameters().getExporting()) {
      ret = ret + "EXPORTING: " + p.getName() + " TYPE " + p.getType().toText(0) + "\n\n";
    }
    for (const p of mdef.getParameters().getChanging()) {
      ret = ret + "CHANGING: " + p.getName() + " TYPE " + p.getType().toText(0) + "\n\n";
    }
    const r = mdef.getParameters().getReturning();
    if (r) {
      ret = ret + "RETURNING: " + r.getName() + " TYPE " + r.getType().toText(0) + "\n\n";
    }

    return ret;
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

  private static findMethodDefinition(found: ICursorData, scope: ISpaghettiScopeNode): Identifier | undefined {
    if (scope.getIdentifier().stype !== ScopeType.ClassDefinition
        || !(found.snode.get() instanceof Statements.MethodDef)) {
      return undefined;
    }

    const nameToken = found.snode.findFirstExpression(Expressions.MethodName)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    // check the cursor is at the right token
    if (nameToken.getStart().getCol() !== found.token.getStart().getCol()
        || nameToken.getStart().getRow() !== found.token.getStart().getRow()) {
      return undefined;
    }

    const def = scope.getParent()?.findClassDefinition(scope.getIdentifier().sname)?.getMethodDefinitions().getByName(nameToken.getStr());
    return def;
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

  private static findFunctionModule(found: ICursorData): string | undefined {
    if (!(found.snode.get() instanceof Statements.CallFunction)) {
      return undefined;
    }

    const name = found.snode.findFirstExpression(Expressions.FunctionName);
    if (name === undefined) {
      return undefined;
    }

    // check the cursor is at the right token
    const token = name.getFirstToken();
    if (token.getStart().getCol() !== found.token.getStart().getCol()
        || token.getStart().getRow() !== found.token.getStart().getRow()) {
      return undefined;
    }

    return token.getStr();
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