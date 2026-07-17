import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {XStringType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class CallTransformation implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const resultParameters = node.findExpressionAfterToken("RESULT");
    const resultSources = new Set(
      resultParameters?.findAllExpressions(Expressions.SimpleSource3) || [],
    );

    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      const isResult = resultSources.has(s);
      Source.runSyntax(s, input, undefined, isResult, false, isResult === false);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(d, input);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, XStringType.get());
      } else {
        Target.runSyntax(t, input);
      }
    }

  }
}
