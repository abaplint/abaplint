import {ABAPObject} from "./_abap_object";
import {ClassDefinition} from "../abap/statements/";
import {SuperClassName} from "../abap/expressions/";

export class Class extends ABAPObject {

  public getType(): string {
    return "CLAS";
  }

  public isException(): boolean {
    for (let file of this.files) {
      if (file.getObjectName().match(/^zcx_.*$/i)) {
        return true;
      }
    }
    return false;
  }

  public getSuperClass(): string {
    const files = this.getParsedFiles();
    if (files.length > 1) {
      throw new Error("class.ts, getSuperClass todo: handle multiple files");
    }
    const node = files[0].getStructure();
    if (!node) {
      return undefined;
    }

    const token = node.findFirstStatement(ClassDefinition).findFirstExpression(SuperClassName);
    return token ? token.getFirstToken().get().getStr() : undefined;
  }

  /*
  public getMethodDefinitions(): string {
    return "todo, some other typing, shared with interface";
  }

  public getMethodImplementation(_name: string): StructureNode {
    return undefined;
  }
*/

}