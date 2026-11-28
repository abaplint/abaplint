import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {Move} from "./move";

/** "COMPUTE [EXACT] target = source." is checked as the assignment "target = source." */
export class Compute implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    new Move().runSyntax(node, input);
  }
}
