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

  public findAllStatements(type: any): StatementNode[] {
    let ret: StatementNode[] = [];
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as StatementNode);
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStatements(type));
      } else {
        throw new Error("findFirstStructure, unexpected type");
      }
    }
    return ret;
  }

  public findFirstStructure(type: any): StructureNode {
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StructureNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        let res = child.findFirstStructure(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstStructure, unexpected type");
      }
    }
    return undefined;
  }

}