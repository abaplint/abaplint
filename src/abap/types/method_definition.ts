import {StatementNode} from "../../abap/nodes";
import {MethodDef} from "../../abap/statements";
import {MethodName} from "../../abap/expressions";
import {MethodParameters} from "./method_parameters";
import {Scope} from "./scope";

export class MethodDefinition {
  private scope: Scope;
  private name: string;
  private parameters: MethodParameters;

// todo:
// abstract
// final
// redefinition

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof MethodDef)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    this.name = node.findFirstExpression(MethodName).getFirstToken().get().getStr();
    this.scope = scope;
    this.parameters = new MethodParameters(node);
  }

  public getName() {
    return this.name;
  }

  public getScope() {
    return this.scope;
  }

  public getParameters() {
    return this.parameters;
  }

}