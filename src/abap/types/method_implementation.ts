import {StructureNode} from "../../abap/nodes";
import {Identifier} from "./_identifier";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";

export class MethodImplementation extends Identifier {

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.Method)) {
      throw new Error("MethodImplementation, expected Method as part of input node");
    }
    const found = node.findFirstExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodImplementation, expected MethodName as part of input node");
    }
    super(found.getFirstToken());
  }

}