import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TableType, StringType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {Source} from "../expressions/source";

export class Split {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const type = node.findTokenSequencePosition("INTO", "TABLE") ? new TableType(new StringType(), false) : new StringType();

    for (const target of node.findAllExpressions(Expressions.Target)) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, type);
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}