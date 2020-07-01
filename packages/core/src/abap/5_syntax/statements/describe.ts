import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {IntegerType} from "../../types/basic";
import {Target} from "../expressions/target";

export class Describe {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo, the source must be of a specific type

    const linesTarget = node.findExpressionAfterToken("LINES");
    if (linesTarget?.get() instanceof Expressions.Target) {
      const inline = linesTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new IntegerType());
      } else {
        new Target().runSyntax(linesTarget, scope, filename);
      }
    }

  }
}