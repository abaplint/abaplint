import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {Dynamic} from "../expressions/dynamic";
import {TypeUtils} from "../_type_utils";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltInCall} from "../_builtin_call";

export class Write implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo, more

    let second = node.getChildren()[1];
    if (second.get() instanceof Expressions.WriteOffsetLength) {
      second = node.getChildren()[2];
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const issueCount = input.issues.length;
      const type = Source.runSyntax(s, input);

      // "Arithmetic calculation not permitted here" on a system, while abs( x ) or lines( itab ) is fine
      const call = s === second && issueCount === input.issues.length && input.scope.getOpenABAP() === false
        ? BuiltInCall.fromSource(s, input) : undefined;
      if (call !== undefined && BuiltInCall.isNumeric(call) && BuiltInCall.hasDataObjectArgument(call) === false) {
        const message = `Numeric function "${BuiltInCall.callName(call)}" in WRITE takes only a single data object as argument`;
        input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
        return;
      }

      if (s === second
          && new TypeUtils(input.scope).isCharLike(type) === false
          && new TypeUtils(input.scope).isHexLike(type) === false) {
        const message = "Source not character like";
        input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
        return;
      }
    }

    for (const s of node.findDirectExpression(Expressions.WriteOffsetLength)?.findDirectExpressions(Expressions.SimpleFieldChain2) || []) {
      FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
    }

    for (const s of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(s, input);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      const targetType = Target.runSyntax(target, input);
      if (new TypeUtils(input.scope).isCharLikeField(targetType) === false) {
        const message = `"${target.concatTokens()}" must be a character-like field (data type C, N, D, or T, got "${
          targetType?.constructor.name}")`;
        input.issues.push(syntaxIssue(input, target.getFirstToken(), message));
      }
    }

  }
}
