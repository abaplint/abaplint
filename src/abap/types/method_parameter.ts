import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName} from "../../abap/expressions";
import {Position} from "../../position";
// import {Type} from "./type";

export class MethodParameter {
  private name: string;
  private position: Position;
//  private type: Type;

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
//    this.type = undefined;

    this.parse(node);
  }

// todo: pass by reference / pass by value

  public getName() {
    return this.name;
  }

  public getType() {
    throw new Error("getType: todo");
  }

  public getPosition() {
    return this.position;
  }

  private parse(node: ExpressionNode) {
    const name = node.findFirstExpression(MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    this.name = name.getFirstToken().getStr();
    if (this.name.substr(0, 1) === "!") {
      this.name = this.name.substr(1);
    }
    this.position = name.getFirstToken().getPos();
  }
}