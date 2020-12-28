import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {XStringType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {Dynamic} from "../expressions/dynamic";

export class CallTransformation {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const d of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, new XStringType());
      } else {
        new Target().runSyntax(t, scope, filename);
      }
    }

  }
}