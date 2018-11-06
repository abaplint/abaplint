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
      } else {
        return false;
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
    for (let file of files) {
      if (file.getFilename().match(/\.clas\.abap$/)) {
        return file.getStructure();
      }
    }
    throw new Error("class.ts, getMain: Could not find main file");
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