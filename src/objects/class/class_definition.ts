import {StructureNode} from "../../abap/nodes";
import {ClassDefinition as ClassDefinitionStru} from "../../abap/structures";
import {MethodDefinitions} from "./method_definitions";
import {SuperClassName} from "../../abap/expressions";
import {ClassDefinition as ClassDefinitionStat} from "../../abap/statements";

export class ClassDefinition {
  private node: StructureNode;

  constructor(node: StructureNode) {
    if (node) {
      this.node = node.findFirstStructure(ClassDefinitionStru);
      if (node === undefined) {
        throw new Error("Class, constructor unexpected node type");
      }
    }

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

  /*
  public getSignature() {
// return everything, attributes + methods + events?
  }

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

  getEvents
  getAttributes
  getImplementing

  public getMethodImplementation(_name: string): StructureNode {
    return undefined;
  }
*/

}