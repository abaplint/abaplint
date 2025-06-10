import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {SyntaxInput} from "../_syntax_input";

export class ReadTextpool implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const t of node.findDirectExpressions(Expressions.SimpleTarget)) {
      Target.runSyntax(t, input);
    }

  }
}