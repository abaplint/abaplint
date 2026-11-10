import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {StringType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ObjectOriented} from "../_object_oriented";
import {BuiltInCall} from "../_builtin_call";

export class Message implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const exceptionName = node.findDirectExpression(Expressions.ExceptionName);
    const classicMessage = exceptionName ? new ObjectOriented(input.scope).checkClassicException() : undefined;
    if (exceptionName && classicMessage) {
      input.issues.push(syntaxIssue(input, exceptionName.getFirstToken(), classicMessage));
      return;
    }

    const found = node.findExpressionAfterToken("INTO");
    const inline = found?.findDirectExpression(Expressions.InlineData);

    if (inline) {
      InlineData.runSyntax(inline, input, StringType.get());
    } else if (found) {
      Target.runSyntax(found, input);
    }

    for (const mss of node.findDirectExpressions(Expressions.MessageSourceSource)) {
      for (const s of mss.findDirectExpressions(Expressions.Source)) {
        const issueCount = input.issues.length;
        Source.runSyntax(s, input);
        // "Arithmetic calculation not permitted here" on a system, whatever the argument
        const call = issueCount === input.issues.length && input.scope.getOpenABAP() === false
          ? BuiltInCall.fromSource(s, input) : undefined;
        if (call !== undefined && BuiltInCall.isNumeric(call)) {
          const message = `Numeric function "${BuiltInCall.callName(call)}" cannot be used in MESSAGE WITH`;
          input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
          return;
        }
      }
      for (const s of mss.findDirectExpressions(Expressions.SimpleSource3)) {
        Source.runSyntax(s, input);
      }
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
