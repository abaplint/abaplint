import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {IntegerType} from "../../types/basic";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class GetRunTime implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const target = node.findDirectExpression(Expressions.Target);

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, IntegerType.get());
    } else if (target) {
      Target.runSyntax(target, input);
    }

  }
}