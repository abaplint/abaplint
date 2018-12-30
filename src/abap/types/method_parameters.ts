import {StatementNode} from "../../abap/nodes/statement_node";
import {MethodDef} from "../../abap/statements/method_def";
import {MethodParameter} from "./method_parameter";
import {MethodDefImporting, MethodParam, MethodDefExporting, MethodDefChanging, MethodDefReturning} from "../../abap/expressions";
import {ExpressionNode}  from "../../abap/nodes";

export class MethodParameters {
  private importing: MethodParameter[];
  private exporting: MethodParameter[];
  private changing: MethodParameter[];
  private returning: MethodParameter | undefined;
  private exceptions: string[]; // todo, not filled

  constructor(node: StatementNode) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    this.importing = [];
    this.exporting = [];
    this.changing = [];
    this.returning = undefined;
    this.exceptions = [];

    this.parse(node);
  }

  public getAll(): MethodParameter[] {
    let ret: MethodParameter[] = [];
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

  private parse(node: StatementNode): void {

    const importing = node.findFirstExpression(MethodDefImporting);
    if (importing) {
      this.add(this.importing, importing);
    }

    const exporting = node.findFirstExpression(MethodDefExporting);
    if (exporting) {
      this.add(this.exporting, exporting);
    }

    const changing = node.findFirstExpression(MethodDefChanging);
    if (changing) {
      this.add(this.changing, changing);
    }

    const returning = node.findFirstExpression(MethodDefReturning);
    if (returning) {
      const found = returning.findFirstExpression(MethodParam);
      if (found) {
        this.returning = new MethodParameter(found);
      }
    }

// todo:
// this.exceptions = [];
// also consider RAISING vs EXCEPTIONS
  }

  private add(target: MethodParameter[], source: ExpressionNode): void {
    const params = source.findAllExpressions(MethodParam);
    for (const param of params) {
      target.push(new MethodParameter(param));
    }
  }

}