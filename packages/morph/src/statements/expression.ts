import {ExpressionStatement} from "ts-morph";
import {handleExpressions} from "../expressions";

export class MorphExpression {
  public run(s: ExpressionStatement) {
    return handleExpressions(s.forEachChildAsArray()) + ".\n";
  }
}