import {PropertyAccessExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphPropertyAccess {
  public run(s: PropertyAccessExpression) {

    const left = s.getExpression();
//    const dot = s.getQuestionDotTokenNode();
    const name = s.getNameNode();
    const leftText = left.getType().getText();
    // console.dir(leftText);

    if (leftText === "string" && name.getText() === "length") {
      return "strlen( " + handleExpression(left) + " )";
    } else if (leftText.endsWith("[]") && name.getText() === "push") {
      return handleExpression(left) + " = VALUE #( BASE " + handleExpression(left) + " ";
    } else if (leftText.endsWith("[]") && name.getText() === "length") {
      return "lines( " + handleExpression(left) + " )";
    } else if (leftText === "string" && name.getText() === "split") {
      return `REDUCE string_table( LET split_input = ` + handleExpression(left);
    } else if (leftText === "string" && name.getText() === "charAt") {
      return "substring( val = " + handleExpression(left) + " len = 1";
    } else if (leftText === "string" && name.getText() === "replace") {
      return "replace( val = " + handleExpression(left);
    } else if (leftText === "string" && name.getText() === "toUpperCase") {
      return "to_upper( val = " + handleExpression(left);
    } else if (leftText === "string" && name.getText() === "trim") {
      return "condense( val = " + handleExpression(left) + " del = |\\n |";
    } else if (leftText === "string" && name.getText() === "substr") {
      return "substring( val = " + handleExpression(left);
    } else if (left.getType().isEnum() === true) {
      return handleExpression(left) + "-" + name.getText();
    } else {
      return handleExpression(left) + "->" + name.getText();
    }
  }
}