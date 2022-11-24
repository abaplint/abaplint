import {ClassDeclaration, ConstructorDeclaration, Identifier, MethodDeclaration, PropertyDeclaration, Scope, SyntaxKind} from "ts-morph";
import {handleStatements} from "../statements";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";

export class MorphClassDeclaration {

  public run(s: ClassDeclaration) {

    let superDefinition: ClassDeclaration | undefined = undefined;

    let inherit = "";
    for (const i of s.getHeritageClauses()) {
      if (i.getToken() === SyntaxKind.ExtendsKeyword) {
        const typ = i.getTypeNodes()[0];
        inherit = " INHERITING FROM " + typ.getText();

        const desc = i.getDescendants();
        const id = desc[desc.length - 1];
        if (id instanceof Identifier) {
          const firstDecl = id.getSymbol()?.getDeclarations()[0];
          if (firstDecl instanceof ClassDeclaration) {
            superDefinition = firstDecl;
          }
        }
      }
    }

    let definition = `CLASS ${s.getName()} DEFINITION${inherit}.
  PUBLIC SECTION.\n`;
    let privateSection = "";
    let implementation = `CLASS ${s.getName()} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        const st = m.isStatic() ? "CLASS-" : "";
        const code = `    ${st}DATA ${m.getName()} TYPE ${handleType(m.getType())}.\n`;

        if (m.getScope() === Scope.Private) {
          privateSection += code;
        } else {
          definition += code;
        }
      } else if (m instanceof ConstructorDeclaration) {
        const parameters = buildParameters(m, true);
        definition += `    METHODS constructor${parameters}.\n`;
        implementation += `  METHOD constructor.\n`;
        implementation += handleStatements(m.getStatements());
        implementation += `  ENDMETHOD.\n\n`;
      } else if (m instanceof MethodDeclaration) {
        const st = m.isStatic() ? "CLASS-" : "";
        let code = "";
        if (superDefinition?.getMember(m.getName())) {
          code = `    ${st}METHODS ${m.getName()} REDEFINITION.\n`;
        } else {
          const parameters = buildParameters(m);
          code = `    ${st}METHODS ${m.getName()}${parameters}.\n`;
        }
        if (m.getScope() === Scope.Private) {
          privateSection += code;
        } else {
          definition += code;
        }

        implementation += `  METHOD ${m.getName()}.\n`;
        implementation += handleStatements(m.getStatements());
        implementation += `  ENDMETHOD.\n\n`;
      } else {
        console.dir(m.constructor.name + " - todo class_declaration");
      }
    }

    if (privateSection !== "") {
      privateSection = "  PRIVATE SECTION.\n" + privateSection;
    }
    definition = definition + privateSection + `ENDCLASS.\n`;
    implementation += `ENDCLASS.\n`;

    return definition + "\n" + implementation;
  }
}