import {BinaryExpression, ClassDeclaration, ConstructorDeclaration, ExpressionStatement, MethodDeclaration, PropertyAccessExpression, PropertyDeclaration} from "ts-morph";
import {handleExpressions} from "../expressions";

export class MorphPropertyAccess {
  public run(s: PropertyAccessExpression) {
    let text = s.getText();
    if (text.startsWith("this.")) {
      text = text.replace("this.", "me->");
    }
    return text;
  }
}