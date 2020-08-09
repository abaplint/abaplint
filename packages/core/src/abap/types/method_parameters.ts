import {StatementNode} from "../nodes/statement_node";
import {MethodDef} from "../2_statements/statements/method_def";
import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {TypedIdentifier, IdentifierMeta} from "./_typed_identifier";
import {UnknownType, VoidType} from "./basic";
import {CurrentScope} from "../5_syntax/_current_scope";
import {MethodDefReturning} from "../5_syntax/expressions/method_def_returning";
import {MethodParam} from "../5_syntax/expressions/method_param";
import {IMethodParameters} from "./_method_parameters";
import {ObjectOriented} from "../5_syntax/_object_oriented";

export class MethodParameters implements IMethodParameters{
  private readonly importing: TypedIdentifier[];
  private readonly exporting: TypedIdentifier[];
  private readonly changing: TypedIdentifier[];
  private returning: TypedIdentifier | undefined;
  private readonly exceptions: string[]; // todo, not filled
  private readonly filename: string;

  public constructor(node: StatementNode, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    this.importing = [];
    this.exporting = [];
    this.changing = [];
    this.returning = undefined;
    this.exceptions = [];
    this.filename = filename;

    this.parse(node, scope);
  }

  public getAll(): TypedIdentifier[] {
    let ret: TypedIdentifier[] = [];
    const returning = this.getReturning();
    if (returning) {
      ret.push(returning);
    }
    ret = ret.concat(this.getImporting());
    ret = ret.concat(this.getExporting());
    ret = ret.concat(this.getChanging());
    return ret;
  }

  public getImporting() {
    return this.importing;
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

///////////////////

  private parse(node: StatementNode, scope: CurrentScope): void {

    const handler = node.findFirstExpression(Expressions.EventHandler);
    if (handler) {
      const className = node.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr();
      const def = scope.findObjectDefinition(className);
      const doVoid = def ? false : !scope.getDDIC().inErrorNamespace(className);

      const eventName = node.findFirstExpression(Expressions.Field)?.getFirstToken().getStr();
      const event = new ObjectOriented(scope).searchEvent(def, eventName);
      for (const p of handler.findAllExpressions(Expressions.MethodParamName)) {
        const token = p.getFirstToken();
        const search = token.getStr().toUpperCase().replace("!", "");
        const found = event?.getParameters().find(p => p.getName().toUpperCase() === search);
        if (found) {
          this.importing.push(new TypedIdentifier(token, this.filename, found.getType(), [IdentifierMeta.EventParameter]));
        } else if (doVoid) {
          this.importing.push(new TypedIdentifier(token, this.filename, new VoidType(className), [IdentifierMeta.EventParameter]));
        } else {
          const type = new UnknownType(`handler parameter not found "${search}"`);
          this.importing.push(new TypedIdentifier(token, this.filename, type, [IdentifierMeta.EventParameter]));
        }
      }
    }

    const importing = node.findFirstExpression(Expressions.MethodDefImporting);
    if (importing) {
      this.add(this.importing, importing, scope, IdentifierMeta.MethodImporting);
    }

    const exporting = node.findFirstExpression(Expressions.MethodDefExporting);
    if (exporting) {
      this.add(this.exporting, exporting, scope, IdentifierMeta.MethodExporting);
    }

    const changing = node.findFirstExpression(Expressions.MethodDefChanging);
    if (changing) {
      this.add(this.changing, changing, scope, IdentifierMeta.MethodChanging);
    }

    const returning = node.findFirstExpression(Expressions.MethodDefReturning);
    if (returning) {
      this.returning = new MethodDefReturning().runSyntax(returning, scope, this.filename, [IdentifierMeta.MethodReturning]);
    }

// todo:
// this.exceptions = [];
// also consider RAISING vs EXCEPTIONS
  }

  private add(target: TypedIdentifier[], source: ExpressionNode, scope: CurrentScope, meta: IdentifierMeta): void {
    const params = source.findAllExpressions(Expressions.MethodParam);
    for (const param of params) {
      target.push(new MethodParam().runSyntax(param, scope, this.filename, [meta]));
    }
  }

}