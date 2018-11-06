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

  public findFirstStatement(_type: any): StatementNode {
    return undefined;
  }
}