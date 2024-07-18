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

    for (const s of node.findAllExpressions(Expressions.Source)) {
      const type = new Source().runSyntax(s, input);
      if (s === second
          && new TypeUtils(input.scope).isCharLike(type) === false
          && new TypeUtils(input.scope).isHexLike(type) === false) {
        const message = "Source not character like";
        input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
        return;
      }
    }

    for (const s of node.findAllExpressions(Expressions.SimpleFieldChain2)) {
      new FieldChain().runSyntax(s, input, ReferenceType.DataReadReference);
    }

    for (const s of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(s, input);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, input);
    }

  }
}