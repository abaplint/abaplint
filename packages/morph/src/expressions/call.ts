import {BinaryExpression, CallExpression, ClassDeclaration, ConstructorDeclaration, ExpressionStatement, MethodDeclaration, PropertyDeclaration} from "ts-morph";
import {handleExpressions} from "../expressions";

export class MorphCall {
  public run(s: CallExpression) {
    return "MorphCall";
  }
}