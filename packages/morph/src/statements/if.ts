import {IfStatement} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings, handleStatement} from "../statements";

export class MorphIf {
  public run(s: IfStatement, settings: MorphSettings) {
    const sexp = s.getExpression();
    let expr = handleExpression(sexp, settings);

    const cname = sexp.constructor.name;
    if (cname === "Identifier" || cname === "PropertyAccessExpression") {
      expr += " IS NOT INITIAL";
    }
    let ret = "IF " + expr + ".\n";

    ret += handleStatement(s.getThenStatement(), settings);

    const el = s.getElseStatement();
    if (el) {
      ret += "ELSE.\n";
      ret += handleStatement(el, settings);
    }

    ret += "ENDIF.\n";
    return ret;
  }
}