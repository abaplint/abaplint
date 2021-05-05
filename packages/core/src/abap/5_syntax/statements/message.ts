import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";

export class Message implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const found = node.findExpressionAfterToken("INTO");
    const inline = found?.findDirectExpression(Expressions.InlineData);

    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, new StringType());
    } else if (found) {
      new Target().runSyntax(found, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findDirectExpressions(Expressions.MessageSource)) {
      new MessageSource().runSyntax(s, scope, filename);
    }

  }
}