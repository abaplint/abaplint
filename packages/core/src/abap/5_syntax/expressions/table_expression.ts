import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput} from "../_syntax_input";

export class TableExpression {
  public runSyntax(node: ExpressionNode | undefined, input: SyntaxInput) {
    if (node === undefined) {
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
  }
}