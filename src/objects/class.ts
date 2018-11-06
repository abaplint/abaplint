import {ABAPObject} from "./_abap_object";
import {ClassDefinition} from "../abap/statements/";
import {SuperClassName} from "../abap/expressions/";
import {MethodDefinitions} from "./class/method_definitions";
import {StructureNode} from "../abap/nodes";

export class Class extends ABAPObject {

  public getType(): string {
    return "CLAS";
  }

// todo:
// isAbstract

  public isException(): boolean {
    for (let file of this.files) {
      if (file.getObjectName().match(/^zcx_.*$/i)) {
        return true;
      }
    }
    return false;
  }

  public getSuperClass(): string {
    const node = this.getMain();
    if (!node) {
      return undefined;
    }

    const token = node.findFirstStatement(ClassDefinition).findFirstExpression(SuperClassName);
    return token ? token.getFirstToken().get().getStr() : undefined;
  }

  public getMethodDefinitions(): MethodDefinitions {
    const node = this.getMain();
    if (!node) {
      return undefined;
    }

    return new MethodDefinitions(node);
  }

  private getMain(): StructureNode {
    const files = this.getParsedFiles();
    if (files.length > 1) {
      throw new Error("class.ts, getMain todo: handle multiple files");
    }
    return files[0].getStructure();
  }

  /*
  public getSignature() {
// return everything, attributes + methods + events?
  }

  public isAbstract(): boolean {
// todo
    return false;
  }

  public getMethodImplementation(_name: string): StructureNode {
    return undefined;
  }
*/

}