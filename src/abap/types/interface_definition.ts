import {Identifier} from "./_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {MethodDefinition, Visibility, ClassAttributes} from ".";

export class InterfaceDefinition extends Identifier {
  private node: StructureNode;

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name);

    this.node = node;
  }

  public getAttributes(): ClassAttributes | undefined {
    if (!this.node) { return undefined; }
    return new ClassAttributes(this.node);
  }

  public getMethodDefinitions(): MethodDefinition[] {
    const ret = [];
    const defs = this.node.findAllStatements(Statements.MethodDef);
    for (const def of defs) {
      ret.push(new MethodDefinition(def, Visibility.Public));
    }
    return ret;
  }

}