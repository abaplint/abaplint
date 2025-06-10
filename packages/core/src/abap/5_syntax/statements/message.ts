import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {StringType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";
import {SyntaxInput} from "../_syntax_input";

export class Message implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const found = node.findExpressionAfterToken("INTO");
    const inline = found?.findDirectExpression(Expressions.InlineData);

    if (inline) {
      InlineData.runSyntax(inline, input, StringType.get());
    } else if (found) {
      Target.runSyntax(found, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource3)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.MessageSource)) {
      MessageSource.runSyntax(s, input);
    }

  }
}