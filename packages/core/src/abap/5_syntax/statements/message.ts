import * as Expressions from "../../2_statements/expressions";
import {InlineData} from "../expressions/inline_data";
import {CharacterType, StringType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ObjectOriented} from "../_object_oriented";
import {BuiltInCall} from "../_builtin_call";
import {ExpressionNode, StatementNode} from "../../nodes";
import {IdentifierMeta} from "../../types/_typed_identifier";

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

    const messageTypes = [
      node.findExpressionAfterToken("TYPE"),
      node.findExpressionAfterToken("LIKE"),
      node.findDirectExpression(Expressions.MessageSource)?.findExpressionAfterToken("TYPE"),
    ];
    for (const messageType of messageTypes) {
      if (messageType !== undefined && this.checkMessageType(messageType, input) === false) {
        return;
      }
    }
  }

  // the message type is checked when it is known statically, ie. a literal or a constant
  private checkMessageType(node: ExpressionNode, input: SyntaxInput): boolean {
    const value = this.staticValue(node, input);
    if (value === undefined || /^[AEISWX]$/i.test(value.trimEnd())) {
      return true;
    }
    const message = `Message type "${value}" is not valid, expected A, E, I, S, W or X`;
    input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    return false;
  }

  private staticValue(node: ExpressionNode, input: SyntaxInput): string | undefined {
    const literal = this.literalValue(node.concatTokens());
    if (literal !== undefined) {
      return literal;
    }

    const name = node.concatTokens();
    if (/^[\w\/]+$/.test(name) === false) {
      return undefined;
    }
    const found = input.scope.findVariable(name);
    const meta = found?.getMeta() ?? [];
    if (found === undefined
        || meta.includes(IdentifierMeta.ReadOnly) === false
        || meta.includes(IdentifierMeta.Static) === false) {
      return undefined;
    }
    const value = found.getValue();
    if (typeof value !== "string") {
      return undefined;
    }
    let constant = this.literalValue(value);
    const type = found.getType();
    if (constant !== undefined && type instanceof CharacterType) {
      constant = constant.substring(0, type.getLength());
    }
    return constant;
  }

  private literalValue(code: string): string | undefined {
    if (/^'([^']|'')*'$/.test(code)) {
      return code.substring(1, code.length - 1).replace(/''/g, "'");
    } else if (/^`([^`]|``)*`$/.test(code)) {
      return code.substring(1, code.length - 1).replace(/``/g, "`");
    }
    return undefined;
  }
}
