import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class GetCursor implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, input);
    }

  }
}