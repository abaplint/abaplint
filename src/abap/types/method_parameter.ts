import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName} from "../../abap/expressions";
import {Identifier} from "./_identifier";

export class MethodParameter extends Identifier {

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam) && !(node.get() instanceof MethodParamName)) {
      throw new Error("MethodParameter, unexpected input node");
    }
    const name = node.findFirstExpression(MethodParamName);
    if (!name) {
      console.dir(node);
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    super(name.getFirstToken());
  }

// todo: pass by reference / pass by value / write protected

}