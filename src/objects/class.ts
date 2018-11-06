import {ABAPObject} from "./_abap_object";
import * as Statements from "../abap/statements/";

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
    let files = this.getParsedFiles();
    if (files.length > 1) {
      throw new Error("class.ts, getSuperClass todo: handle multiple files");
    }

    let node = files[0].getStructure();
    // todo
    node.findFirstStatement(Statements.ClassDefinition);

    return undefined;
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