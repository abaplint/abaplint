import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// unlike EXIT and CHECK, which leave the processing block outside of loops
export class Continue implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    if (input.inAnyLoop !== true) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), "CONTINUE can only be used in loops"));
    }
  }
}
