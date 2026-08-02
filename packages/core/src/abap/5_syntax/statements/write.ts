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

export class Write implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo, more

    let second = node.getChildren()[1];
    if (second.get() instanceof Expressions.WriteOffsetLength) {
      second = node.getChildren()[2];
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const type = Source.runSyntax(s, input);
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
        const message = `"${target.getFirstToken().getStr()}" must be a character-like field (data type C, N, D, or T)`;
        input.issues.push(syntaxIssue(input, target.getFirstToken(), message));
      }
    }

  }
}
