import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {SyntaxInput} from "../_syntax_input";
import {Select} from "./select";

export class SQLSetOpGroup {

  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    if (node.findDirectExpression(Expressions.SQLFrom)) {
      Select.runSyntax(node, input, true);
    }

    for (const group of node.findDirectExpressions(Expressions.SQLSetOpGroup)) {
      SQLSetOpGroup.runSyntax(group, input);
    }

    for (const setop of node.findDirectExpressions(Expressions.SQLSetOp)) {
      SQLSetOpGroup.runSyntax(setop, input);
    }
  }

}
