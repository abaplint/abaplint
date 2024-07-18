import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {PackedType} from "../../types/basic";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class GetTime implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const target = node.findDirectExpression(Expressions.Target);

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, input, new PackedType(8, 0));
    } else if (target) {
      new Target().runSyntax(target, input);
    }

  }
}