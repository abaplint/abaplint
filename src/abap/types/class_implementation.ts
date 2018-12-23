import {Identifier} from "./_identifier";
import {StructureNode} from "../../abap/nodes";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";

export class ClassImplementation extends Identifier {

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.ClassImplementation)) {
      throw new Error("ClassDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.ClassImplementation)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();
    super(name, node);
  }

  public getMethodImplementations() {
// todo
  }

}