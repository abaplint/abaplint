import {ClassDeclaration, ConstructorDeclaration, Identifier, MethodDeclaration, PropertyDeclaration, Scope, SyntaxKind} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings, handleStatements} from "../statements";
import {handleType} from "../types";
import {buildParameters} from "./_helpers";
import {mapName} from "../map_name";

export class MorphClassDeclaration {

  public run(s: ClassDeclaration, settings: MorphSettings) {

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
    const global = settings.globalObjects ? " PUBLIC" : "";

    let definition = `CLASS ${mapName(s.getName(), settings)} DEFINITION${inherit}${classAbstract}${global}.
  PUBLIC SECTION.${interfaces}\n`;
    let privateSection = "";
    let implementation = `CLASS ${mapName(s.getName(), settings)} IMPLEMENTATION.\n`;

    for (const m of s.getMembers()) {
      if (m instanceof PropertyDeclaration) {
        let init = handleExpression(m.getInitializer(), settings);
        if (init !== "") {
          init = " VALUE " + init;
        }

        const st = m.isStatic() ? "CLASS-" : "";
        const code = `    ${st}DATA ${m.getName()} TYPE ${handleType(m.getType(), settings)}${init}.\n`;

        if (m.getScope() === Scope.Private) {
          privateSection += code;
        } else {
          definition += code;
        }
      } else if (m instanceof ConstructorDeclaration) {
        const parameters = buildParameters(m, settings, true);
        definition += `    METHODS constructor${parameters}.\n`;
        implementation += `  METHOD constructor.\n`;
        implementation += handleStatements(m.getStatements(), settings);
        implementation += `  ENDMETHOD.\n\n`;
      } else if (m instanceof MethodDeclaration) {
        let pre = "";
        if (itype?.getProperty(m.getName())) {
          definition += `    ALIASES ${m.getName()} FOR ${itype.getSymbol()?.getName()}~${m.getName()}.\n`;
          pre = itype.getSymbol()?.getName() + "~";
        } else if (m.getName().startsWith("[")) {
          // nothing
        } else {
          const st = m.isStatic() ? "CLASS-" : "";
          let code = "";
          if (superDefinition?.getMember(m.getName())) {
            code = `    ${st}METHODS ${m.getName()} REDEFINITION.\n`;
          } else {
            const parameters = buildParameters(m, settings);
            code = `    ${st}METHODS ${m.getName()}${parameters}.\n`;
          }
          if (m.getScope() === Scope.Private) {
            privateSection += code;
          } else {
            definition += code;
          }
        }

        if (m.getName().startsWith("[") === false) {
          implementation += `  METHOD ${pre}${m.getName()}.\n`;
          implementation += handleStatements(m.getStatements(), settings);
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