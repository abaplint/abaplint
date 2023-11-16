import {InterfaceDeclaration, MethodSignature, PropertyDeclaration} from "ts-morph";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";
import {MorphSettings} from "../statements";
import {mapName} from "../map_name";

export class MorphInterfaceDeclaration {

  public run(s: InterfaceDeclaration, settings: MorphSettings) {

    const global = settings.globalObjects ? " PUBLIC" : "";
    let definition = `INTERFACE ${mapName(s.getName(), settings)}${global}.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        definition += `  DATA ${m.getName()} TYPE ${handleType(m.getType(), settings)}.\n`;
      } else if (m instanceof MethodSignature) {
        const parameters = buildParameters(m, settings);
        definition += parameters.definition + `  METHODS ${m.getName()}${parameters.parameters}.\n`;
      } else {
        console.dir(m.constructor.name + " - todo class_declaration");
      }
    }

    definition += `ENDINTERFACE.\n`;
    return definition + "\n";
  }
}