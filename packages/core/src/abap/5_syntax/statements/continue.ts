import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Continue implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    // Check if we're inside a loop context
    if ((input.loopLevel || 0) === 0) {
      const message = "CONTINUE is not allowed outside of loops";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }
  }
}