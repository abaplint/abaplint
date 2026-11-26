import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// RETRY restarts the TRY block of the CATCH block it is in, so it is only possible in a CATCH block
export class Retry implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    if (input.inCatch !== true) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), "RETRY is only allowed in a CATCH block"));
    }
  }
}
