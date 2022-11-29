import {ClassDeclaration, ConstructorDeclaration, Identifier, MethodDeclaration, PropertyDeclaration, Scope, SyntaxKind} from "ts-morph";
import {handleExpression} from "../expressions";
import {handleStatements} from "../statements";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";

export class MorphClassDeclaration {

  public run(s: ClassDeclaration) {

    let superDefinition: ClassDeclaration | undefined = undefined;

    // will    s.getExtends()   work?
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

    const itype = s.getImplements()[0]?.getType();
    let interfaces = "";
    if (itype) {
      interfaces = "\n    INTERFACES " + itype.getSymbol()?.getName() + ".";
    }
    const classAbstract = s.isAbstract() ? " ABSTRACT" : "";

    let definition = `CLASS ${s.getName()} DEFINITION${inherit}${classAbstract}.
  PUBLIC SECTION.${interfaces}\n`;
    let privateSection = "";
    let implementation = `CLASS ${s.getName()} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        let init = handleExpression(m.getInitializer());
        if (init !== "") {
          init = " VALUE " + init;
        }

        const st = m.isStatic() ? "CLASS-" : "";
        const code = `    ${st}DATA ${m.getName()} TYPE ${handleType(m.getType())}${init}.\n`;

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
        let pre = "";
        if (itype?.getProperty(m.getName())) {
          definition += `    ALIASES ${m.getName()} FOR ${itype.getSymbol()?.getName()}~${m.getName()}.\n`;
          pre = itype.getSymbol()?.getName() + "~";
        } else {
          const st = m.isStatic() ? "CLASS-" : "";
          let code = "";
          if (superDefinition?.getMember(m.getName())) {
            code = `    ${st}METHODS ${m.getName()} REDEFINITION.\n`;
          } else {
            const parameters = buildParameters(m);
            const methodAbstract = m.isAbstract() ? " ABSTRACT" : "";
            code = `    ${st}METHODS ${m.getName()}${methodAbstract}${parameters}.\n`;
          }
          if (m.getScope() === Scope.Private) {
            privateSection += code;
          } else {
            definition += code;
          }
        }

        if (m.isAbstract() === false) {
          implementation += `  METHOD ${pre}${m.getName()}.\n`;
          implementation += handleStatements(m.getStatements());
          implementation += `  ENDMETHOD.\n\n`;
        }
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