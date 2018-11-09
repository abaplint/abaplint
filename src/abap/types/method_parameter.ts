import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName} from "../../abap/expressions";
import Position from "../../position";

export class MethodParameter {
  private name: string;
  private position: Position;
// private type: ??;

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }

    this.parse(node);
  }

  public getName() {
    return this.name;
  }

  public getPosition() {
    return this.position;
  }

  private parse(node: ExpressionNode) {
    let name = node.findFirstExpression(MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    this.name = name.getFirstToken().get().getStr();
    if (this.name.substr(0, 1) === "!") {
      this.name = this.name.substr(1);
    }
    this.position = name.getFirstToken().get().getPos();
  }
}