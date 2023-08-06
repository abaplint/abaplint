import {StatementNode} from "../nodes/statement_node";
import {MethodDef} from "../2_statements/statements/method_def";
import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {TypedIdentifier, IdentifierMeta} from "./_typed_identifier";
import {ObjectReferenceType, UnknownType, VoidType} from "./basic";
import {CurrentScope} from "../5_syntax/_current_scope";
import {MethodDefReturning} from "../5_syntax/expressions/method_def_returning";
import {MethodParam} from "../5_syntax/expressions/method_param";
import {IMethodParameters} from "./_method_parameters";
import {ObjectOriented} from "../5_syntax/_object_oriented";
import {ReferenceType} from "../5_syntax/_reference";
import {Identifier as IdentifierToken} from "../1_lexer/tokens/identifier";
import {ScopeType} from "../5_syntax/_scope_type";

// todo:
// this.exceptions = [];
// also consider RAISING vs EXCEPTIONS

export class MethodParameters implements IMethodParameters {
  private preferred: string | undefined;
  private returning: TypedIdentifier | undefined;
  private readonly importing: TypedIdentifier[];
  private readonly optional: string[];
  private readonly exporting: TypedIdentifier[];
  private readonly changing: TypedIdentifier[];
  private readonly exceptions: string[]; // todo, not filled
  private readonly defaults: {[index: string]: ExpressionNode};
  private readonly filename: string;

  public constructor(node: StatementNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    this.importing = [];
    this.exporting = [];
    this.changing = [];
    this.optional = [];
    this.defaults = {};
    this.returning = undefined;
    this.preferred = undefined;
    this.exceptions = [];
    this.filename = filename;

    // need the scope for LIKE typing inside method parameters
    scope.push(ScopeType.MethodDefinition, "method definition", node.getStart(), filename);
    this.parse(node, scope, filename);
    scope.pop(node.getEnd());
  }

  public getFilename(): string {
    return this.filename;
  }

  public getOptional(): string[] {
    return this.optional;
  }

  public getAll(): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];
    const returning = this.getReturning();
    if (returning) {
      ret.push(returning);
    }
    ret.push(...this.getImporting());
    ret.push(...this.getExporting());
    ret.push(...this.getChanging());
    return ret;
  }

  public getDefaultImporting(): string | undefined {
    if (this.importing.length === 0) {
      return undefined;
    } else if (this.importing.length === 1) {
      return this.importing[0].getName().toUpperCase();
    } else if (this.preferred) {
      return this.preferred;
    }

    let candidates = this.importing.map(i => i.getName().toUpperCase());
    candidates = candidates.filter(c => this.optional.indexOf(c) < 0);
    if (candidates.length === 1) {
      return candidates[0];
    }

    return undefined;
  }

  public getImporting() {
    return this.importing;
  }

  public getRequiredParameters() {
    const ret: TypedIdentifier[] = [];

    for (const i of this.getImporting()) {
      if (this.getOptional().some(o => o.toUpperCase() === i.getName().toUpperCase()) === true) {
        continue;
      } else if (this.preferred?.toUpperCase() === i.getName().toUpperCase()) {
        continue;
      }
      ret.push(i);
    }
    for (const i of this.getChanging()) {
      if (this.getOptional().some(o => o.toUpperCase() === i.getName().toUpperCase()) === true) {
        continue;
      }
      ret.push(i);
    }

    return ret;
  }

  public getExporting() {
    return this.exporting;
  }

  public getChanging() {
    return this.changing;
  }

  public getReturning() {
    return this.returning;
  }

  public getExceptions() {
    return this.exceptions;
  }

  public getParameterDefault(parameter: string) {
    return this.defaults[parameter.toUpperCase()];
  }

///////////////////

  private parse(node: StatementNode, scope: CurrentScope, filename: string): void {

    const handler = node.findFirstExpression(Expressions.EventHandler);
    if (handler) {
      const nameToken = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
      const ooName = nameToken?.getStr();
      const def = scope.findObjectDefinition(ooName);
      const doVoid = def ? false : !scope.getDDIC().inErrorNamespace(ooName);
      if (def) {
        scope.addReference(nameToken, def, ReferenceType.ObjectOrientedReference, filename);
      } else if (doVoid && ooName) {
        scope.addReference(nameToken, undefined, ReferenceType.ObjectOrientedVoidReference,
                           this.filename, {ooName: ooName.toUpperCase()});
      }

      const eventName = node.findFirstExpression(Expressions.EventName)?.getFirstToken().getStr();
      const event = new ObjectOriented(scope).searchEvent(def, eventName);
      for (const p of handler.findAllExpressions(Expressions.MethodParamName)) {
        const token = p.getFirstToken();
        const search = token.getStr().toUpperCase().replace("!", "");
        this.optional.push(search); // all parameters optional for event handlers
        if (search === "SENDER" && def) {
          this.importing.push(new TypedIdentifier(token, this.filename, new ObjectReferenceType(def), [IdentifierMeta.EventParameter]));
          continue;
        }
        const found = event?.getParameters().find(p => p.getName().toUpperCase() === search);
        if (found) {
          this.importing.push(new TypedIdentifier(token, this.filename, found.getType(), [IdentifierMeta.EventParameter]));
        } else if (doVoid) {
          this.importing.push(new TypedIdentifier(token, this.filename, new VoidType(ooName), [IdentifierMeta.EventParameter]));
        } else {
          const type = new UnknownType(`handler parameter not found "${search}"`);
          this.importing.push(new TypedIdentifier(token, this.filename, type, [IdentifierMeta.EventParameter]));
        }
      }
      return;
    }

    const importing = node.findFirstExpression(Expressions.MethodDefImporting);
    if (importing) {
      this.add(this.importing, importing, scope, [IdentifierMeta.MethodImporting]);
      if (importing.concatTokens().toUpperCase().includes(" PREFERRED PARAMETER")) {
        this.preferred = importing.getLastToken().getStr().toUpperCase();
        if (this.preferred.startsWith("!")) {
          this.preferred = this.preferred.substring(1);
        }
      }
    }

    const exporting = node.findFirstExpression(Expressions.MethodDefExporting);
    if (exporting) {
      this.add(this.exporting, exporting, scope, [IdentifierMeta.MethodExporting]);
    }

    const changing = node.findFirstExpression(Expressions.MethodDefChanging);
    if (changing) {
      this.add(this.changing, changing, scope, [IdentifierMeta.MethodChanging]);
    }

    const returning = node.findFirstExpression(Expressions.MethodDefReturning);
    if (returning) {
      this.returning = new MethodDefReturning().runSyntax(returning, scope, this.filename, [IdentifierMeta.MethodReturning]);
    }

    this.workaroundRAP(node, scope, filename);
  }

  private workaroundRAP(node: StatementNode, scope: CurrentScope, filename: string): void {
    const resultName = node.findExpressionAfterToken("RESULT");
    const isRap = node.findExpressionAfterToken("IMPORTING");
    if (isRap) {
      for (const foo of node.findDirectExpressions(Expressions.MethodParamName)) {
        if (foo === resultName) {
          continue;
        }
        this.importing.push(new TypedIdentifier(foo.getFirstToken(), filename, new VoidType("RapMethodParameter"), [IdentifierMeta.MethodImporting]));
      }

      if (node.concatTokens().toUpperCase().includes(" FOR VALIDATE ")
          || node.concatTokens().toUpperCase().includes(" FOR BEHAVIOR ")
          || node.concatTokens().toUpperCase().includes(" FOR FEATURES ")
          || node.concatTokens().toUpperCase().includes(" FOR MODIFY ")) {
        const token = isRap.getFirstToken();
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "failed"), filename, new VoidType("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "mapped"), filename, new VoidType("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "reported"), filename, new VoidType("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
      }
    }

    if (resultName) {
      const token = resultName.getFirstToken();
      this.importing.push(new TypedIdentifier(token, filename, new VoidType("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
    }

    // its some kind of magic
    if (scope.getName().toUpperCase() === "CL_ABAP_BEHAVIOR_SAVER") {
      const tempChanging = this.changing.map(c => new TypedIdentifier(c.getToken(), filename, new VoidType("RapMethodParameter"), c.getMeta()));
      while (this.changing.length > 0) {
        this.changing.shift();
      }
      this.changing.push(...tempChanging);

      const tempImporting = this.importing.map(c => new TypedIdentifier(c.getToken(), filename, new VoidType("RapMethodParameter"), c.getMeta()));
      while (this.importing.length > 0) {
        this.importing.shift();
      }
      this.importing.push(...tempImporting);
    }
  }

  private add(target: TypedIdentifier[], source: ExpressionNode, scope: CurrentScope, meta: IdentifierMeta[]): void {
    for (const opt of source.findAllExpressions(Expressions.MethodParamOptional)) {
      const p = opt.findDirectExpression(Expressions.MethodParam);
      if (p === undefined) {
        continue;
      }
      const extraMeta: IdentifierMeta[] = [];
      if (opt.concatTokens().toUpperCase().startsWith("VALUE(")) {
        extraMeta.push(IdentifierMeta.PassByValue);
      } else if (meta.includes(IdentifierMeta.MethodImporting)) {
        extraMeta.push(IdentifierMeta.ReadOnly);
      }
      const id = new MethodParam().runSyntax(p, scope, this.filename, [...meta, ...extraMeta]);
      scope.addIdentifier(id);
      target.push(id);
      if (opt.getLastToken().getStr().toUpperCase() === "OPTIONAL") {
        const name = target[target.length - 1].getName().toUpperCase();
        this.optional.push(name);
      } else if (opt.findFirstExpression(Expressions.Default)) {
        const name = target[target.length - 1].getName().toUpperCase();
        this.optional.push(name);

        const val = opt.findFirstExpression(Expressions.Default)?.getLastChild();
        if (val && val instanceof ExpressionNode) {
          this.defaults[name] = val;
        }
      }
    }
    if (target.length > 0) {
      return;
    }

    const params = source.findAllExpressions(Expressions.MethodParam);
    for (const param of params) {
      target.push(new MethodParam().runSyntax(param, scope, this.filename, meta));
    }
  }

}