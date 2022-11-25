import {ElementAccessExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphElementAccess {
  public run(s: ElementAccessExpression) {
    return handleExpression(s.getExpression()) +
      "[ " + handleExpression(s.getArgumentExpression()) + " + 1 ]";
  }
}