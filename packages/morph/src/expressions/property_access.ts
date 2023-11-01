import {PropertyAccessExpression} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphPropertyAccess {
  public run(s: PropertyAccessExpression, settings: MorphSettings) {

    const left = s.getExpression();
//    const dot = s.getQuestionDotTokenNode();
    const name = s.getNameNode();
    const leftText = left.getType().getText();
    // console.dir(leftText);

    if (leftText === "string" && name.getText() === "length") {
      return "strlen( " + handleExpression(left, settings) + " )";
    } else if (leftText.endsWith("[]") && name.getText() === "push") {
      return handleExpression(left, settings) + " = VALUE #( BASE " + handleExpression(left, settings) + " ";
    } else if (leftText.endsWith("[]") && name.getText() === "length") {
      return "lines( " + handleExpression(left, settings) + " )";
    } else if (leftText === "string" && name.getText() === "split") {
      return `REDUCE string_table( LET split_input = ` + handleExpression(left, settings);
    } else if (leftText === "string" && name.getText() === "charAt") {
      return "substring( val = " + handleExpression(left, settings) + " len = 1";
    } else if (leftText === "string" && name.getText() === "replace") {
      return "replace( val = " + handleExpression(left, settings);
    } else if (leftText === "string" && name.getText() === "toUpperCase") {
      return "to_upper( val = " + handleExpression(left, settings);
    } else if (leftText === "string" && name.getText() === "trim") {
      return "condense( val = " + handleExpression(left, settings) + " del = |\\n |";
    } else if (leftText === "string" && name.getText() === "substr") {
      return "substring( val = " + handleExpression(left, settings);
    } else if (left.getType().isEnum() === true) {
      return handleExpression(left, settings) + "-" + name.getText();
    } else {
      return handleExpression(left, settings) + "->" + name.getText();
    }
  }
}