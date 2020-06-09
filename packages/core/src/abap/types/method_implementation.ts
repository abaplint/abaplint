import {StructureNode} from "../nodes";
import {Identifier} from "../4_file_information/_identifier";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";

export class MethodImplementation extends Identifier {

  public constructor(node: StructureNode, filename: string) {
    if (!(node.get() instanceof Structures.Method)) {
      throw new Error("MethodImplementation, expected Method as part of input node");
    }
    const found = node.findFirstExpression(Expressions.MethodName);
    if (found === undefined) {
      throw new Error("MethodImplementation, expected MethodName as part of input node");
    }
    super(found.getFirstToken(), filename);
  }

}