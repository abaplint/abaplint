import {BasicNode} from "./_basic_node";
import {Structure} from "../structures/_structure";
import {StatementNode} from "./statement_node";

export class StructureNode extends BasicNode {
  private structure: Structure;

  public constructor(structure: Structure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

  public findFirstStatement(type: any): StatementNode {

    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StatementNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        let res = child.findFirstStatement(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstStatement, unexpected type");
      }
    }

    return undefined;
  }
}