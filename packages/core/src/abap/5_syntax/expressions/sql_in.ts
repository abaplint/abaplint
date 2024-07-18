import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {TableType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {SQLSource} from "./sql_source";

export class SQLIn {

  public runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): void {

    if (node.getChildren().length === 2) {
      const insource = node.findFirstExpression(Expressions.SQLSource);
      if (insource) {
        const intype = new SQLSource().runSyntax(insource, input);
        if (intype &&
            !(intype instanceof VoidType) &&
            !(intype instanceof UnknownType) &&
            !(intype instanceof TableType)) {
          const message = "IN, not a table";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.SQLSource)) {
      new SQLSource().runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.SQLSourceNoSpace)) {
      new SQLSource().runSyntax(s, input);
    }

  }

}