import {IfStatement, ReturnStatement} from "ts-morph";
import {handleExpression, handleExpressions} from "../expressions";
import {handleStatement} from "../statements";

export class MorphIf {
  public run(s: IfStatement) {
    let ret = "IF " + handleExpression(s.getExpression()) + ".\n";

    ret += handleStatement(s.getThenStatement());

    const el = s.getElseStatement();
    if (el) {
      ret += "ELSE.\n";
      ret += handleStatement(el);
    }

    ret += "ENDIF.\n";
    return ret;
  }
}