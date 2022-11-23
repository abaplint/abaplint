import {ClassDeclaration, ConstructorDeclaration, MethodDeclaration, ParameteredNode, PropertyDeclaration, ReturnTypedNode} from "ts-morph";
import {handleStatements} from "../statements";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";

export class MorphClassDeclaration {

  public run(s: ClassDeclaration) {

    let definition = `CLASS ${s.getName()} DEFINITION.
  PUBLIC SECTION.\n`;
    let implementation = `CLASS ${s.getName()} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        definition += `    DATA ${m.getName()} TYPE ${handleType(m.getType())}.\n`;
      } else if (m instanceof ConstructorDeclaration) {
        const parameters = buildParameters(m, true);
        definition += `    METHODS constructor${parameters}.\n`;
        implementation += `  METHOD constructor.\n`;
        implementation += handleStatements(m.getStatements());
        implementation += `  ENDMETHOD.\n\n`;
      } else if (m instanceof MethodDeclaration) {
        const parameters = buildParameters(m);
        definition += `    METHODS ${m.getName()}${parameters}.\n`;
        implementation += `  METHOD ${m.getName()}.\n`;
        implementation += handleStatements(m.getStatements());
        implementation += `  ENDMETHOD.\n\n`;
      } else {
        console.dir(m.constructor.name + " - todo class_declaration");
      }
    }

    definition += `ENDCLASS.\n`;
    implementation += `ENDCLASS.\n`;

    return definition + "\n" + implementation;
  }
}