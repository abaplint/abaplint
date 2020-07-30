import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";

export class FieldOffset {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, _filename: string): void {

    const field = node.findDirectExpression(Expressions.SourceField);
    if (field) {
      const found = scope.findVariable(field.getFirstToken().getStr());
      if (found === undefined) {
        throw new Error("\"" + field.getFirstToken().getStr() + "\" not found, FieldOffset");
      }
    }

    const symbol = node.findDirectExpression(Expressions.SourceFieldSymbol);
    if (symbol) {
      const found = scope.findVariable(symbol.getFirstToken().getStr());
      if (found === undefined) {
        throw new Error("\"" + symbol.getFirstToken().getStr() + "\" not found, FieldOffset");
      }
    }

  }
}