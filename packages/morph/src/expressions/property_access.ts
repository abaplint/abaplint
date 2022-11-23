import {PropertyAccessExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphPropertyAccess {
  public run(s: PropertyAccessExpression) {

    const left = s.getExpression();
//    const dot = s.getQuestionDotTokenNode();
    const name = s.getNameNode();

    if (left.getType().getText() === "string" && name.getText() === "length") {
      return "strlen( " + handleExpression(left) + " )";
    } else if (left.getType().getText().endsWith("[]") && name.getText() === "length") {
      return "lines( " + handleExpression(left) + " )";
    } else if (left.getType().getText() === "string" && name.getText() === "replace") {
      return "replace( val = " + handleExpression(left);
    } else if (left.getType().getText() === "string" && name.getText() === "trim") {
      return "condense( " + handleExpression(left);
    } else if (left.getType().getText() === "string" && name.getText() === "substr") {
      return "substring( val = " + handleExpression(left);
    } else {
      return handleExpression(left) + "->" + name.getText();
    }
  }
}