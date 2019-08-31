import {ExpressionNode} from "../../abap/nodes";
import {FieldChain, MethodCallChain, Target} from "../../abap/expressions";

export class ModelChain {

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodCallChain ||
       node.get() instanceof FieldChain ||
       node.get() instanceof Target)) {
      throw new Error("MethodCallChain,FieldChain or Target expected.");
    }

    const children = node.getChildren();
    let chain = "";
    let text = "";
    for (const child of children) {
      chain = chain + child.get().constructor.name + " ";
      text = text + child.getFirstToken().getStr() + "";
    }
    console.log(node.get().constructor.name + ": " + chain + "(" + text + ")");
  }


}