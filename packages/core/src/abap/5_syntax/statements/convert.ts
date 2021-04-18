import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {TimeType, DateType, PackedType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";

export class Convert implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo, the source must be of a specific type

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const timeTarget = node.findExpressionAfterToken("TIME");
    if (timeTarget?.get() instanceof Expressions.Target) {
      const inline = timeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new TimeType());
      } else {
        new Target().runSyntax(timeTarget, scope, filename);
      }
    }

    const dateTarget = node.findExpressionAfterToken("DATE");
    if (dateTarget?.get() instanceof Expressions.Target) {
      const inline = dateTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new DateType());
      } else {
        new Target().runSyntax(dateTarget, scope, filename);
      }
    }

    const stampTarget = node.findExpressionAfterToken("STAMP");
    if (stampTarget?.get() instanceof Expressions.Target) {
      const inline = stampTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new PackedType(8, 4));
      } else {
        new Target().runSyntax(stampTarget, scope, filename);
      }
    }

  }
}