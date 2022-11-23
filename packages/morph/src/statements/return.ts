import {BinaryExpression, ReturnStatement} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphReturn {
  public run(s: ReturnStatement) {
    let ret = "";
    const expr = s.getExpression();
    if (expr) {
      ret += "return = ";
      if (expr instanceof BinaryExpression) {
        ret += "xsdbool( " + handleExpression(expr) + " ).\n";
      } else {
        ret += handleExpression(expr) + ".\n";
      }
    }
    return ret + "RETURN.\n";
  }
}