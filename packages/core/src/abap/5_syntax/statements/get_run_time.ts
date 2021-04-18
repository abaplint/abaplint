import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {IntegerType} from "../../types/basic";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";

export class GetRunTime implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const target = node.findDirectExpression(Expressions.Target);

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, new IntegerType());
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }

  }
}