import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName} from "../../abap/expressions";

export class MethodParameter {
  private name: string;

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

// todo, type
    this.parse(node);
  }

  public getName() {
    return this.name;
  }

  private parse(node: ExpressionNode) {
    let name = node.findFirstExpression(MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    this.name = name.getFirstToken().get().getStr();
  }
}