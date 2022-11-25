import {BinaryExpression} from "ts-morph";
import {handleExpression, handleExpressions} from "../expressions";

export class MorphBinary {
  public run(s: BinaryExpression) {
    const left = handleExpression(s.getLeft());
    const operator = handleExpression(s.getOperatorToken());
    const right = handleExpression(s.getRight());

    let ret = handleExpressions(s.forEachChildAsArray());
    if (operator.trim() === "EQ" && right === "undefined") {
      ret = left + " IS INITIAL";
    } else if (operator.trim() === "+"
        && s.getLeft().getType().getText() === "string") {
      ret = left + " && " + right;
    } else {
      ret = left + operator + right;
    }
    return ret;
  }
}