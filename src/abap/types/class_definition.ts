import {StructureNode} from "../../abap/nodes";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../../abap/expressions";
import {ClassDefinition as ClassDefinitionStat} from "../../abap/statements";
import {ClassAttributes} from "./class_attributes";

export class ClassDefinition {
  private node: StructureNode;

  constructor(node: StructureNode) {
    this.node = node;
  }

  public getMethodDefinitions(): MethodDefinitions {
    if (!this.node) { return undefined; }
    return new MethodDefinitions(this.node);
  }

  public getSuperClass(): string {
    if (!this.node) { return undefined; }
    const token = this.node.findFirstStatement(ClassDefinitionStat).findFirstExpression(SuperClassName);
    return token ? token.getFirstToken().get().getStr() : undefined;
  }

  public getAttributes(): ClassAttributes {
    if (!this.node) { return undefined; }
    return new ClassAttributes(this.node);
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