import {ABAPObject} from "./_abap_object";
import {MethodDefinition} from "../abap/types/method_definition";
import {MethodDef} from "../abap/statements";
import {StructureNode} from "../abap/nodes";
import {Scope} from "../abap/types/scope";

export class Interface extends ABAPObject {

  public getType(): string {
    return "INTF";
  }

  public getMethodDefinitions(): MethodDefinition[] {
    const node = this.getMain();
    if (!node) {
      return [];
    }

    let ret = [];
    let defs = node.findAllStatements(MethodDef);
    for (let def of defs) {
      ret.push(new MethodDefinition(def, Scope.Public));
    }
    return ret;
  }

  private getMain(): StructureNode {
    const files = this.getParsedFiles();
    if (files.length > 1) {
      throw new Error("interface.ts, did not expect multiple parsed files");
    }
    return files[0].getStructure();
  }

}