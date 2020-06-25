import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {IntegerType} from "../../types/basic";

export class Describe {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo, the source must be of a specific type

    const timeTarget = node.findExpressionAfterToken("LINES");
    if (timeTarget?.get() instanceof Expressions.Target) {
      const inline = timeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new IntegerType());
      }
    }

  }
}