import {StatementNode} from "../../abap/nodes/statement_node";
import {MethodDef} from "../../abap/statements/method_def";
import {MethodParameter} from "./method_parameter";
import {MethodDefImporting, MethodParam} from "../../abap/expressions";

export class MethodParameters {
  private importing: MethodParameter[];
  private exporting: MethodParameter[];
  private changing: MethodParameter[];
  private returning: MethodParameter;
  private exceptions: string[];

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

    let importing = node.findFirstExpression(MethodDefImporting);
    if (importing) {
      let params = importing.findAllExpressions(MethodParam);
      for (let param of params) {
        this.importing.push(new MethodParameter(param));
      }
    }

// todo:
// this.exporting = [];
// this.changing = [];
// this.returning = undefined;
// this.exceptions = [];
  }

}