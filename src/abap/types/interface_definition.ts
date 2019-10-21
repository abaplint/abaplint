import {Identifier} from "./_identifier";
import {StructureNode} from "../nodes";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {MethodDefinition, Visibility, Attributes} from ".";

export class InterfaceDefinition extends Identifier {
  private readonly node: StructureNode;

  constructor(node: StructureNode, filename: string) {
    if (!(node.get() instanceof Structures.Interface)) {
      throw new Error("InterfaceDefinition, unexpected node type");
    }

    const name = node.findFirstStatement(Statements.Interface)!.findFirstExpression(Expressions.InterfaceName)!.getFirstToken();
    super(name, filename);

    this.node = node;
  }

  public getAttributes(): Attributes | undefined {
    if (!this.node) { return undefined; }
    return new Attributes(this.node, this.filename);
  }

  public isLocal(): boolean {
    return !this.isGlobal();
  }

  public isGlobal(): boolean {
    return this.node.findFirstExpression(Expressions.Global) !== undefined;
  }

  public getMethodDefinitions(): MethodDefinition[] {
    const ret = [];
    const defs = this.node.findAllStatements(Statements.MethodDef);
    for (const def of defs) {
      ret.push(new MethodDefinition(def, Visibility.Public, this.filename));
    }
    return ret;
  }

}