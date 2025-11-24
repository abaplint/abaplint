import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {TimeType, DateType, PackedType, CharacterType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Convert implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo, the source must be of a specific type

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    const timeTargets = node.findExpressionsAfterToken("TIME");
    for (const timeTarget of timeTargets) {
      const concat = node.concatTokens().toUpperCase();
      if (timeTarget?.get() instanceof Expressions.Target) {
        const inline = timeTarget?.findDirectExpression(Expressions.InlineData);
        if (inline) {
          let targetType = new TimeType();
          if (concat.includes("DAYLIGHT SAVING TIME " + inline.concatTokens().toUpperCase())) {
            targetType = new CharacterType(1);
          }
          InlineData.runSyntax(inline, input, targetType);
        } else {
          Target.runSyntax(timeTarget, input);
        }
      }
    }

    const dateTarget = node.findExpressionAfterToken("DATE");
    if (dateTarget?.get() instanceof Expressions.Target) {
      const inline = dateTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, new DateType());
      } else {
        Target.runSyntax(dateTarget, input);
      }
    }

    const stampTarget = node.findExpressionAfterToken("STAMP");
    if (stampTarget?.get() instanceof Expressions.Target) {
      const inline = stampTarget?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, new PackedType(8, 4));
      } else {
        Target.runSyntax(stampTarget, input);
      }
    }

  }
}