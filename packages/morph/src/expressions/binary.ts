import {BinaryExpression, ElementAccessExpression} from "ts-morph";
import {handleExpression, handleExpressions} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphBinary {
  public run(s: BinaryExpression, settings: MorphSettings) {

    const eLeft = s.getLeft();
    const left = handleExpression(s.getLeft(), settings);
    const operator = handleExpression(s.getOperatorToken(), settings);
    const eRight = s.getRight();
    const right = handleExpression(eRight, settings);
/*
    console.dir(left);
    console.dir(operator);
    console.dir(right);
*/

    let ret = handleExpressions(s.forEachChildAsArray(), settings);
    if (operator.trim() === "EQ" && right === "undefined") {
      ret = left + " IS INITIAL";
    } else if (operator.trim() === "+"
        && s.getLeft().getType().getText() === "string") {
      ret = left + " && " + right;
    } else if (eLeft instanceof ElementAccessExpression && operator.trim() === "=" && right === "abap_true") {
      const arg = handleExpression(eLeft.getArgumentExpression(), settings);
      const expr = handleExpression(eLeft.getExpression(), settings);
      ret = "APPEND " + arg + " TO " + expr;
    } else {
      ret = left + operator + right;
    }
    return ret;
  }
}