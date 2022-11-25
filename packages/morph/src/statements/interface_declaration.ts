import {InterfaceDeclaration, MethodSignature, PropertyDeclaration} from "ts-morph";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";

export class MorphInterfaceDeclaration {

  public run(s: InterfaceDeclaration) {

    let definition = `INTERFACE ${s.getName()}.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        definition += `  DATA ${m.getName()} TYPE ${handleType(m.getType())}.\n`;
      } else if (m instanceof MethodSignature) {
        const parameters = buildParameters(m);
        definition += `  METHODS ${m.getName()}${parameters}.\n`;
      } else {
        console.dir(m.constructor.name + " - todo class_declaration");
      }
    }

    definition += `ENDINTERFACE.\n`;
    return definition + "\n";
  }
}