import {ClassDeclaration, ConstructorDeclaration, MethodDeclaration, PropertyDeclaration} from "ts-morph";
import {handleStatements} from "../statements";

export class MorphClassDeclaration {
  private definition = "";
  private implementation = "";

  public run(s: ClassDeclaration) {

    this.definition += `CLASS ${s.getName()} DEFINITION.
  PUBLIC SECTION.\n`;
    this.implementation += `CLASS ${s.getName()} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        this.definition += `    DATA ${m.getName()} TYPE ${m.getType().getText()}.\n`;
      } else if (m instanceof ConstructorDeclaration) {
        this.definition += `    METHODS constructor.\n`;
        this.implementation += `  METHOD constructor.\n`;
        this.implementation += handleStatements(m.getStatements());
        this.implementation += `  ENDMETHOD.\n`;
      } else if (m instanceof MethodDeclaration) {

        let parameters = "";
        for (const p of m.getParameters()) {
          parameters += `${p.getName()} TYPE ${p.getType().getText()}`;
        }
        if (parameters !== "") {
          parameters = " IMPORTING " + parameters;
        }
        if (m.getReturnType().getText() !== "void") {
          // note: return is a keyword in TypeScript/JavaScript so it will never overlap
          parameters += ` RETURNING VALUE(return) TYPE ` + m.getReturnType().getText();
        }

        this.definition += `    METHODS ${m.getName()}${parameters}.\n`;
        this.implementation += `  METHOD ${m.getName()}.\n`;
        this.implementation += handleStatements(m.getStatements());
        this.implementation += `  ENDMETHOD.\n`;
      } else {
        console.dir(m.constructor.name);
      }
    }

    this.definition += `ENDCLASS.\n`;
    this.implementation += `ENDCLASS.\n`;


    return this.definition + "\n" + this.implementation;
  }
}