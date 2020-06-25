import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {PackedType} from "../../types/basic";

export class GetTime {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.Target);

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, new PackedType(8, 0));
    }

  }
}