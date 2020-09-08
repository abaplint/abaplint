import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";

export class FieldOffset {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    const field = node.findDirectExpression(Expressions.SourceField);
    if (field) {
      const token = field.getFirstToken();
      const found = scope.findVariable(token.getStr());
      if (found === undefined) {
        throw new Error("\"" + field.getFirstToken().getStr() + "\" not found, FieldOffset");
      }
      scope.addReference(token, found, ReferenceType.DataReadReference, filename);
    }

    const symbol = node.findDirectExpression(Expressions.SourceFieldSymbol);
    if (symbol) {
      const token = symbol.getFirstToken();
      const found = scope.findVariable(token.getStr());
      if (found === undefined) {
        throw new Error("\"" + symbol.getFirstToken().getStr() + "\" not found, FieldOffset");
      }
      scope.addReference(token, found, ReferenceType.DataReadReference, filename);
    }

  }
}