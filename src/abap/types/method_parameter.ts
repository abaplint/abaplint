import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName} from "../../abap/expressions";
import {TypedIdentifier} from "./_typed_identifier";

export class MethodParameter extends TypedIdentifier {

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const name = node.findFirstExpression(MethodParamName);
    if (!name) {
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    super(name.getFirstToken().getStr(), name.getFirstToken().getPos());
  }

// todo: pass by reference / pass by value

}