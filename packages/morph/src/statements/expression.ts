import {ExpressionStatement} from "ts-morph";
import {handleExpressions} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphExpression {
  public run(s: ExpressionStatement, settings: MorphSettings) {
    return handleExpressions(s.forEachChildAsArray(), settings) + ".\n";
  }
}