import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {VoidType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";

export class LoopAtScreen implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, input);
    }

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, input, VoidType.get("SCREEN"));
    }
  }
}