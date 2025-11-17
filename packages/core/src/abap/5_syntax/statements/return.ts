import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Source} from "../expressions/source";

export class Return implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const source = node.findDirectExpression(Expressions.Source);
    if (source) {
      const ret = input.scope.findReturningParameter();
      if (ret === undefined) {
        const message = "Method does not have a RETURNING parameter to assign to";
        input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
        return;
      }

      input.scope.addReference(source.getFirstToken(), ret, ReferenceType.DataReadReference, input.filename);

      Source.runSyntax(source, input, ret.getType());
    }

  }
}