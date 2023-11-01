import {BinaryExpression, ReturnStatement} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphReturn {
  public run(s: ReturnStatement, settings: MorphSettings) {
    let ret = "";
    const expr = s.getExpression();
    if (expr) {
      ret += "return = ";
      if (expr instanceof BinaryExpression) {
        ret += "xsdbool( " + handleExpression(expr, settings) + " ).\n";
      } else {
        ret += handleExpression(expr, settings) + ".\n";
      }
    }
    return ret + "RETURN.\n";
  }
}