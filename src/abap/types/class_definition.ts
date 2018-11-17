import {StructureNode} from "../../abap/nodes";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../../abap/expressions";
import * as Statements from "../../abap/statements";
import * as Structures from "../../abap/structures";
import {ClassAttributes} from "./class_attributes";

export class ClassDefinition {
  private node: StructureNode;

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.ClassDefinition)) {
      throw new Error("ClassDefinition, unexpected node type");
    }
    this.node = node;
  }

  public getMethodDefinitions(): MethodDefinitions {
    if (!this.node) { return undefined; }
    return new MethodDefinitions(this.node);
  }

  public getSuperClass(): string {
    if (!this.node) { return undefined; }
    const token = this.node.findFirstStatement(Statements.ClassDefinition).findFirstExpression(SuperClassName);
    return token ? token.getFirstToken().get().getStr() : undefined;
  }

  public getAttributes(): ClassAttributes {
    if (!this.node) { return undefined; }
    return new ClassAttributes(this.node);
  }

// todo, this logic is not correct
  public isException(): boolean {
    const superClass = this.getSuperClass();
    if (superClass && superClass.match(/^.?cx_.*$/i)) {
      return true;
    } else {
      return false;
    }
  }

  /*

  public isAbstract(): boolean {
// todo
    return false;
  }

  public isFinal(): boolean {
// todo
    return false;
  }

  public isForTesting(): boolean {
// todo
    return false;
  }

  public isLocal(): boolean {
// todo
    return false;
  }

  public isGlobal(): boolean {
// todo
    return false;
  }

  public getEvents() {

  public getImplementing() {

  ???
  public getMethodImplementation(_name: string): StructureNode {
    return undefined;
  }
*/

}