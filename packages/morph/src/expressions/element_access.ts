import {ElementAccessExpression, SyntaxKind} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphElementAccess {
  public run(s: ElementAccessExpression) {
    const eArg = s.getArgumentExpression();
    const arg = handleExpression(eArg);
    const sexpr = handleExpression(s.getExpression());

    if (eArg?.isKind(SyntaxKind.Identifier)) {
      return `line_exists( ${sexpr}[ table_line = ${arg} ] )`;
    } else {
      return sexpr + "[ " + arg + " + 1 ]";
    }
  }
}