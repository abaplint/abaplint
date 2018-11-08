import {BasicNode} from "./_basic_node";
import {Structure} from "../structures/_structure";
import {StatementNode} from "./statement_node";
import {Statement} from "../statements/_statement";
import {TokenNode} from "./token_node";

export class StructureNode extends BasicNode {
  private structure: Structure;

  public constructor(structure: Structure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

  public findParent(node: StatementNode): StructureNode {
    for (let child of this.getChildren()) {
      if (child === node) {
        return this;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        let res = child.findParent(node);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findParent, unexpected type");
      }
    }
    return undefined;
  }

  public findFirstStatement(type: new () => Statement): StatementNode {
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

  public getFirstToken(): TokenNode {
    for (let child of this.getChildren()) {
      if (child instanceof StatementNode) {
        return child.getFirstToken();
      } else if (child instanceof StructureNode) {
        return child.getFirstToken();
      }
    }
    throw new Error("getFirstToken, unexpected type");
  }

  public findAllStatements(type: new () => Statement): StatementNode[] {
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

  public findAllStructures(type: new () => Structure): StructureNode[] {
    let ret: StructureNode[] = [];
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as StructureNode);
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStructures(type));
      } else {
        throw new Error("findAllStructures, unexpected type");
      }
    }
    return ret;
  }

  public findFirstStructure(type: new () => Structure): StructureNode {
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