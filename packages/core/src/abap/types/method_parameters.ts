/* eslint-disable max-len */
import {StatementNode} from "../nodes/statement_node";
import {MethodDef} from "../2_statements/statements/method_def";
import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {TypedIdentifier, IdentifierMeta} from "./_typed_identifier";
import {ObjectReferenceType, UnknownType, VoidType} from "./basic";
import {MethodDefReturning} from "../5_syntax/expressions/method_def_returning";
import {MethodParam} from "../5_syntax/expressions/method_param";
import {IMethodParameters} from "./_method_parameters";
import {ObjectOriented} from "../5_syntax/_object_oriented";
import {ReferenceType} from "../5_syntax/_reference";
import {Identifier as IdentifierToken} from "../1_lexer/tokens/identifier";
import {ScopeType} from "../5_syntax/_scope_type";
import {SyntaxInput} from "../5_syntax/_syntax_input";

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

  public constructor(node: StatementNode, input: SyntaxInput, abstractMethod: boolean) {
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
    this.filename = input.filename;

    // need the scope for LIKE typing inside method parameters
    const parentName = input.scope.getName();
    input.scope.push(ScopeType.MethodDefinition, "method definition", node.getStart(), input.filename);
    this.parse(node, input, parentName, abstractMethod);
    input.scope.pop(node.getEnd());
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

  private parse(node: StatementNode, input: SyntaxInput, parentName: string, abstractMethod: boolean): void {

    const handler = node.findFirstExpression(Expressions.EventHandler);
    if (handler) {
      const nameToken = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
      const ooName = nameToken?.getStr();
      const def = input.scope.findObjectDefinition(ooName);
      const doVoid = def ? false : !input.scope.getDDIC().inErrorNamespace(ooName);
      if (def) {
        input.scope.addReference(nameToken, def, ReferenceType.ObjectOrientedReference, input.filename);
      } else if (doVoid && ooName) {
        input.scope.addReference(
          nameToken, undefined, ReferenceType.ObjectOrientedVoidReference,
          this.filename, {ooName: ooName.toUpperCase()});
      }

      const eventName = node.findFirstExpression(Expressions.EventName)?.getFirstToken().getStr();
      const event = new ObjectOriented(input.scope).searchEvent(def, eventName);
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
          this.importing.push(new TypedIdentifier(token, this.filename, VoidType.get(ooName), [IdentifierMeta.EventParameter]));
        } else {
          const type = new UnknownType(`handler parameter not found "${search}"`);
          this.importing.push(new TypedIdentifier(token, this.filename, type, [IdentifierMeta.EventParameter]));
        }
      }
      return;
    }

    const importing = node.findFirstExpression(Expressions.MethodDefImporting);
    if (importing) {
      this.add(this.importing, importing, input, [IdentifierMeta.MethodImporting], abstractMethod);
      if (importing.findDirectTokenByText("PREFERRED")) {
        this.preferred = importing.getLastToken().getStr().toUpperCase();
        if (this.preferred.startsWith("!")) {
          this.preferred = this.preferred.substring(1);
        }
      }
    }

    const exporting = node.findFirstExpression(Expressions.MethodDefExporting);
    if (exporting) {
      this.add(this.exporting, exporting, input, [IdentifierMeta.MethodExporting], abstractMethod);
    }

    const changing = node.findFirstExpression(Expressions.MethodDefChanging);
    if (changing) {
      this.add(this.changing, changing, input, [IdentifierMeta.MethodChanging], abstractMethod);
    }

    const returning = node.findFirstExpression(Expressions.MethodDefReturning);
    if (returning) {
      this.returning = MethodDefReturning.runSyntax(returning, input, [IdentifierMeta.MethodReturning]);
    }

    this.workaroundRAP(node, input, parentName);
  }

  private workaroundRAP(node: StatementNode, input: SyntaxInput, parentName: string): void {
    const resultName = node.findExpressionAfterToken("RESULT");
    const isRap = node.findExpressionAfterToken("IMPORTING");
    if (isRap) {
      for (const foo of node.findDirectExpressions(Expressions.MethodParamName)) {
        if (foo === resultName) {
          continue;
        }
        this.importing.push(new TypedIdentifier(foo.getFirstToken(), input.filename, VoidType.get("RapMethodParameter"), [IdentifierMeta.MethodImporting]));
      }

      const concat = node.concatTokens().toUpperCase();
      if (concat.includes(" FOR VALIDATE ")
          || concat.includes(" FOR BEHAVIOR ")
          || concat.includes(" FOR FEATURES ")
          || concat.includes(" FOR INSTANCE FEATURES ")
          || concat.includes(" FOR READ ")
          || concat.includes(" FOR MODIFY ")) {
        const token = isRap.getFirstToken();
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "failed"), input.filename, VoidType.get("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "mapped"), input.filename, VoidType.get("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
        this.exporting.push(new TypedIdentifier(new IdentifierToken(token.getStart(), "reported"), input.filename, VoidType.get("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
      }
    }

    if (resultName) {
      const token = resultName.getFirstToken();
      this.importing.push(new TypedIdentifier(token, input.filename, VoidType.get("RapMethodParameter"), [IdentifierMeta.MethodExporting]));
    }

    // its some kind of magic
    if (parentName.toUpperCase() === "CL_ABAP_BEHAVIOR_SAVER") {
      const tempChanging = this.changing.map(c => new TypedIdentifier(c.getToken(), input.filename, VoidType.get("RapMethodParameter"), c.getMeta()));
      while (this.changing.length > 0) {
        this.changing.shift();
      }
      this.changing.push(...tempChanging);

      const tempImporting = this.importing.map(c => new TypedIdentifier(c.getToken(), input.filename, VoidType.get("RapMethodParameter"), c.getMeta()));
      while (this.importing.length > 0) {
        this.importing.shift();
      }
      this.importing.push(...tempImporting);
    }
  }

  private add(target: TypedIdentifier[], source: ExpressionNode, input: SyntaxInput, meta: IdentifierMeta[], abstractMethod: boolean): void {
    for (const opt of source.findAllExpressions(Expressions.MethodParamOptional)) {
      const p = opt.findDirectExpression(Expressions.MethodParam);
      if (p === undefined) {
        continue;
      }
      const extraMeta: IdentifierMeta[] = [];
      if (p.getFirstToken().getStr().toUpperCase() === "VALUE" && p.getChildren()[1]?.getFirstToken().getStr() === "(") {
        extraMeta.push(IdentifierMeta.PassByValue);
      } else if (meta.includes(IdentifierMeta.MethodImporting)) {
        extraMeta.push(IdentifierMeta.ReadOnly);
      }
      if (abstractMethod === true) {
        extraMeta.push(IdentifierMeta.Abstract);
      }
      const id = MethodParam.runSyntax(p, input, [...meta, ...extraMeta]);
      input.scope.addIdentifier(id);
      target.push(id);
      if (opt.findDirectTokenByText("OPTIONAL")) {
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
      target.push(MethodParam.runSyntax(param, input, meta));
    }
  }

}