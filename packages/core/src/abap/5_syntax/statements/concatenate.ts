import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StringType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";

export class Concatenate {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const target = node.findFirstExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      // todo, does this give XSTRING in BYTE MODE?
      new InlineData().runSyntax(inline, scope, filename, new StringType());
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }
  }
}