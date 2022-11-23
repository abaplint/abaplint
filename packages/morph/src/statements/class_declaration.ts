import {ClassDeclaration, ConstructorDeclaration, MethodDeclaration, ParameteredNode, PropertyDeclaration, ReturnTypedNode} from "ts-morph";
import {handleStatements} from "../statements";
import {handleType} from "../types";

function buildParameters(m: ReturnTypedNode & ParameteredNode, noReturning?: boolean): string {
  let parameters = "";
  for (const p of m.getParameters()) {
    parameters += `${p.getName()} TYPE ${handleType(p.getType())}`;
  }
  if (parameters !== "") {
    parameters = " IMPORTING " + parameters;
  }
  if (m.getReturnType().getText() !== "void" && noReturning !== true) {
    // note: return is a keyword in TypeScript/JavaScript so it will never overlap
    parameters += ` RETURNING VALUE(return) TYPE ` + handleType(m.getReturnType());
  }
  return parameters;
}

export class MorphClassDeclaration {
  private definition = "";
  private implementation = "";

  public run(s: ClassDeclaration) {

    this.definition += `CLASS ${s.getName()} DEFINITION.
  PUBLIC SECTION.\n`;
    this.implementation += `CLASS ${s.getName()} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        this.definition += `    DATA ${m.getName()} TYPE ${handleType(m.getType())}.\n`;
      } else if (m instanceof ConstructorDeclaration) {
        const parameters = buildParameters(m, true);
        this.definition += `    METHODS constructor${parameters}.\n`;
        this.implementation += `  METHOD constructor.\n`;
        this.implementation += handleStatements(m.getStatements());
        this.implementation += `  ENDMETHOD.\n\n`;
      } else if (m instanceof MethodDeclaration) {
        const parameters = buildParameters(m);
        this.definition += `    METHODS ${m.getName()}${parameters}.\n`;
        this.implementation += `  METHOD ${m.getName()}.\n`;
        this.implementation += handleStatements(m.getStatements());
        this.implementation += `  ENDMETHOD.\n\n`;
      } else {
        console.dir(m.constructor.name + " - todo class_declaration");
      }
    }

    this.definition += `ENDCLASS.\n`;
    this.implementation += `ENDCLASS.\n`;

    return this.definition + "\n" + this.implementation;
  }
}