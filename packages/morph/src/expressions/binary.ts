import {BinaryExpression, ElementAccessExpression} from "ts-morph";
import {handleExpression, handleExpressions} from "../expressions";

export class MorphBinary {
  public run(s: BinaryExpression) {

    const eLeft = s.getLeft();
    const left = handleExpression(s.getLeft());
    const operator = handleExpression(s.getOperatorToken());
    const eRight = s.getRight();
    const right = handleExpression(eRight);
/*
    console.dir(left);
    console.dir(operator);
    console.dir(right);
*/

    let ret = handleExpressions(s.forEachChildAsArray());
    if (operator.trim() === "EQ" && right === "undefined") {
      ret = left + " IS INITIAL";
    } else if (operator.trim() === "+"
        && s.getLeft().getType().getText() === "string") {
      ret = left + " && " + right;
    } else if (eLeft instanceof ElementAccessExpression && operator.trim() === "=" && right === "abap_true") {
      const arg = handleExpression(eLeft.getArgumentExpression());
      const expr = handleExpression(eLeft.getExpression());
      ret = "APPEND " + arg + " TO " + expr;
    } else {
      ret = left + operator + right;
    }
    return ret;
  }
}