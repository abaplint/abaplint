import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {SyntaxInput} from "../_syntax_input";
import {Dynamic} from "./dynamic";

export class SQLOrderBy {

  public runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): void {
    const dyn = node.findDirectExpression(Expressions.Dynamic);
    if (dyn) {
      new Dynamic().runSyntax(dyn, input);
    }
  }

}