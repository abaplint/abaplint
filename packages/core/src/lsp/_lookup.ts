import * as LServer from "vscode-languageserver-types";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ICursorData, LSPUtils} from "./_lsp_utils";
import {TypedIdentifier, IdentifierMeta} from "../abap/types/_typed_identifier";
import {Identifier} from "../abap/4_file_information/_identifier";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {IClassDefinition} from "../abap/types/_class_definition";
import {BuiltIn} from "../abap/5_syntax/_builtin";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Class, Interface} from "../objects";
import {IInterfaceDefinition} from "../abap/types/_interface_definition";
import {ABAPFile} from "../abap/abap_file";

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

    let hoverValue = "";
    const ddicRefs = reg.getDDICReferences().listByFilename(cursor.identifier.getFilename(), cursor.identifier.getStart().getRow());
    for (const d of ddicRefs) {
      if (d.object && d.token && d.token.getStart().equals(cursor.identifier.getStart())) {
        hoverValue += `DDIC: ${d.object.getType()} ${d.object.getName()}`;
      }
    }

    const refs = this.searchReferences(bottomScope, cursor.token);
    if (refs.length > 0) {
      for (const ref of refs) {
        if (hoverValue !== "") {
          hoverValue += "\n_________________\n";
        }
        hoverValue += this.referenceHover(ref, bottomScope, reg);
      }

      let definition: LServer.Location | undefined = undefined;
      if (refs[0].resolved) {
        definition = LSPUtils.identiferToLocation(refs[0].resolved);
        if (definition.uri === BuiltIn.filename) {
          definition = undefined;
        }
      }
      return {hover: hoverValue, definition, definitionId: refs[0].resolved, scope: bottomScope};
    }

    if (hoverValue !== "") {
      return {hover: hoverValue, scope: bottomScope};
    }
    return undefined;
  }

////////////////////////////////////////////

  private static dumpType(variable: TypedIdentifier): string {
    let value = variable.toText() + "\n\nType: " + variable.getType().toText(0);
    if (variable.getValue()) {
      value = value + "\n\nValue: ```" + variable.getValue() + "```";
    }
    if (variable.getMeta().length > 0) {
      value = value + "\n\nMeta: " + variable.getMeta().join(", ");
    }
    if (variable.getType().containsVoid() === true) {
      value = value + "\n\nContains void types";
    }
    if (variable.getType().getQualifiedName()) {
      value = value + "\n\nQualified type name: ```" + variable.getType().getQualifiedName() + "```";
    }
    if (variable.getType().isGeneric() === true) {
      value = value + "\n\nIs generic type";
    }

    return value;
  }

  private static referenceHover(ref: IReference, scope: ISpaghettiScopeNode, reg: IRegistry): string {
    let name = "";
    if (ref.resolved) {
      name = "```" + ref.resolved.getName() + "```";
    }
    let ret = `${ref.referenceType} ${name}`;

    if (ref.referenceType === ReferenceType.MethodReference && ref.extra?.ooName) {
      let cdef: IClassDefinition | IInterfaceDefinition | undefined = scope.findClassDefinition(ref.extra.ooName);
      if (cdef === undefined) {
        cdef = scope.findInterfaceDefinition(ref.extra.ooName);
      }
      if (cdef === undefined) {
        cdef = (reg.getObject("CLAS", ref.extra.ooName) as Class | undefined)?.getDefinition();
      }
      if (cdef === undefined) {
        cdef = (reg.getObject("INTF", ref.extra.ooName) as Interface | undefined)?.getDefinition();
      }

      ret += "\n\n" + this.hoverMethod(ref.position.getName(), cdef);
    } else if (ref.resolved instanceof TypedIdentifier) {
      ret += "\n\n" + this.dumpType(ref.resolved);
    }

    if (ref.extra !== undefined && Object.keys(ref.extra).length > 0) {
      ret += "\n\nExtra: " + JSON.stringify(ref.extra);
    }

    return ret;
  }

  private static hoverMethod(method: string, def: IClassDefinition | IInterfaceDefinition | undefined): string {
    if (def === undefined) {
      return "class not found";
    }

    const mdef = def.getMethodDefinitions().getByName(method);
    if (mdef === undefined) {
      return "method not found in definition";
    }

    let ret = "";
    if (mdef.getParameters().getImporting().length > 0) {
      ret += "IMPORTING\n";
      for (const p of mdef.getParameters().getImporting()) {
        ret += this.singleParameter(p);
      }
    }

    if (mdef.getParameters().getExporting().length > 0) {
      ret += "EXPORTING\n";
      for (const p of mdef.getParameters().getExporting()) {
        ret += this.singleParameter(p);
      }
    }

    if (mdef.getParameters().getChanging().length > 0) {
      ret += "CHANGING\n";
      for (const p of mdef.getParameters().getChanging()) {
        ret += this.singleParameter(p);
      }
    }

    const r = mdef.getParameters().getReturning();
    if (r) {
      ret += "RETURNING\n" + this.singleParameter(r);
    }

    if (mdef.getRaising().length > 0) {
      ret += "RAISING\n";
      for (const p of mdef.getRaising()) {
        ret += "* " + p + "\n";
      }
    }

    return ret;
  }

  private static singleParameter(p: TypedIdentifier): string {
    let extra = p.getMeta().join(", ");
    if (extra !== "") {
      extra = "(Meta: " + extra + ")";
    }
    return "* " + p.getName() + extra + " TYPE " + p.getType().toText(1) + "\n\n";
  }

  private static searchReferences(scope: ISpaghettiScopeNode, token: Token): IReference[] {
    const ret: IReference[] = [];

    for (const r of scope.getData().references) {
      if (r.position.getStart().equals(token.getStart())) {
        ret.push(r);
      }
    }

    const parent = scope.getParent();
    if (parent) {
      ret.push(...this.searchReferences(parent, token));
    }

    return ret;
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

    if (found.snode.findFirstExpression(Expressions.Redefinition)) {
      return undefined;
    }

    // check the cursor is at the right token
    if (nameToken.getStart().getCol() !== found.token.getStart().getCol()
        || nameToken.getStart().getRow() !== found.token.getStart().getRow()) {
      return undefined;
    }

    const def = scope.getParent()?.findClassDefinition(scope.getIdentifier().sname)?.getMethodDefinitions()?.getByName(nameToken.getStr());
    return def;
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