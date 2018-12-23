import {Identifier} from "./_identifier";
import {StructureNode} from "../../abap/nodes";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {MethodImplementation} from "./method_implementation";

export class ClassImplementation extends Identifier {
  private node: StructureNode;

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.ClassImplementation)) {
      throw new Error("ClassImplementation, unexpected node type");
    }
    const name = node.findFirstStatement(Statements.ClassImplementation)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();
    super(name, node);

    this.node = node;
  }

  public getMethodImplementations(): MethodImplementation[] {
    const ret: MethodImplementation[] = [];
    for (const method of this.node.findAllStructures(Structures.Method)) {
      ret.push(new MethodImplementation(method));
    }
    return ret;
  }

}