import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import {MethodName} from "../../abap/expressions";

export enum Scope {
  Private = 1,
  Protected,
  Public,
}

export class MethodDefinition {
  private scope: Scope;
  private name: string;

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    this.name = node.findFirstExpression(MethodName).getFirstToken().get().getStr();
    this.scope = scope;
  }

  public getName() {
    return this.name;
  }

  public getScope() {
    return this.scope;
  }
}