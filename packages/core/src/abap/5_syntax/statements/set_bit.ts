import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SetBit implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const typ = Target.runSyntax(t, input);
      if (typ && new TypeUtils(input.scope).isHexLike(typ) === false) {
        const message = "Input must be byte-like";
        input.issues.push(syntaxIssue(input, t.getFirstToken(), message));
        return;
      }
    }
  }
}