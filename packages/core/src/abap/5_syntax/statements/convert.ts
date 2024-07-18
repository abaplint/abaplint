import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {TimeType, DateType, PackedType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Convert implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo, the source must be of a specific type

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    const timeTarget = node.findExpressionAfterToken("TIME");
    if (timeTarget?.get() instanceof Expressions.Target) {
      const inline = timeTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, new TimeType());
      } else {
        new Target().runSyntax(timeTarget, input);
      }
    }

    const dateTarget = node.findExpressionAfterToken("DATE");
    if (dateTarget?.get() instanceof Expressions.Target) {
      const inline = dateTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, new DateType());
      } else {
        new Target().runSyntax(dateTarget, input);
      }
    }

    const stampTarget = node.findExpressionAfterToken("STAMP");
    if (stampTarget?.get() instanceof Expressions.Target) {
      const inline = stampTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, new PackedType(8, 4));
      } else {
        new Target().runSyntax(stampTarget, input);
      }
    }

  }
}