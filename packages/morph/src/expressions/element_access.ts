import {ElementAccessExpression, SyntaxKind} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphElementAccess {
  public run(s: ElementAccessExpression, settings: MorphSettings) {
    const eArg = s.getArgumentExpression();
    const arg = handleExpression(eArg, settings);
    const sexpr = handleExpression(s.getExpression(), settings);

    if (eArg?.isKind(SyntaxKind.Identifier)) {
      return `line_exists( ${sexpr}[ table_line = ${arg} ] )`;
    } else {
      return sexpr + "[ " + arg + " + 1 ]";
    }
  }
}