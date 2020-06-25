import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {TimeType, DateType} from "../../types/basic";

export class Convert {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const timeTarget = node.findExpressionAfterToken("TIME");
    if (timeTarget?.get() instanceof Expressions.Target) {
      const inline = timeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new TimeType());
      }
    }

    const dateTarget = node.findExpressionAfterToken("DATE");
    if (dateTarget?.get() instanceof Expressions.Target) {
      const inline = dateTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new DateType());
      }
    }

  }
}