import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {isDeep} from "../_character_start";

// HIDE stores the field in the hide area of the list line, deep fields are not possible
export class Hide implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const source = node.findDirectExpression(Expressions.Source);
    if (source === undefined) {
      return;
    }

    const type = Source.runSyntax(source, input);
    if (type !== undefined && isDeep(type)) {
      const message = `"${source.concatTokens()}" cannot be a table, a reference, a string, or contain any of these objects`;
      input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
    }
  }
}
