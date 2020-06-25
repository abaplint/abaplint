import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType} from "../../types/basic";

export class Find {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const found = node.findExpressionAfterToken("SUBMATCHES");

    const inline = found?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, new StringType());
    }

  }
}