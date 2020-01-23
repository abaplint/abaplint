import {StatementNode} from "../../abap/nodes/statement_node";
import {MethodDef} from "../../abap/statements/method_def";
import {MethodDefImporting, MethodParam, MethodDefExporting, MethodDefChanging,
  MethodDefReturning, EventHandler, MethodParamName} from "../../abap/expressions";
import {ExpressionNode}  from "../../abap/nodes";
import {TypedIdentifier} from "./_typed_identifier";
import {UnknownType} from "./basic";
import {CurrentScope} from "../syntax/_current_scope";

export class MethodParameters {
  private readonly importing: TypedIdentifier[];
  private readonly exporting: TypedIdentifier[];
  private readonly changing: TypedIdentifier[];
  private returning: TypedIdentifier | undefined;
  private readonly exceptions: string[]; // todo, not filled
  private readonly filename: string;

  constructor(node: StatementNode, filename: string, scope: CurrentScope) {
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

  private parse(node: StatementNode, scope: CurrentScope): void {

    const handler = node.findFirstExpression(EventHandler);
    if (handler) {
      for (const p of handler.findAllExpressions(MethodParamName)) {
        const token = p.getFirstToken();
        this.importing.push(new TypedIdentifier(token, this.filename, new UnknownType("todo")));
      }
    }

    const importing = node.findFirstExpression(MethodDefImporting);
    if (importing) {
      this.add(this.importing, importing, scope);
    }

    const exporting = node.findFirstExpression(MethodDefExporting);
    if (exporting) {
      this.add(this.exporting, exporting, scope);
    }

    const changing = node.findFirstExpression(MethodDefChanging);
    if (changing) {
      this.add(this.changing, changing, scope);
    }

    const returning = node.findFirstExpression(MethodDefReturning);
    if (returning) {
      const found = returning.findFirstExpression(MethodParam);
      if (found) {
        const para = found.get() as MethodParam;
        this.returning = para.runSyntax(found, scope, this.filename);
      }
    }

// todo:
// this.exceptions = [];
// also consider RAISING vs EXCEPTIONS
  }

  private add(target: TypedIdentifier[], source: ExpressionNode, scope: CurrentScope): void {
    const params = source.findAllExpressions(MethodParam);
    for (const param of params) {
      const para = param.get() as MethodParam;
      target.push(para.runSyntax(param, scope, this.filename));
    }
  }

}