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

    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, input);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, input);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, input, XStringType.get());
      } else {
        new Target().runSyntax(t, input);
      }
    }

  }
}