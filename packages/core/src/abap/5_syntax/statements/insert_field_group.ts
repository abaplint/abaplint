import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class InsertFieldGroup implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const s of node.findAllExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource1)) {
      Source.runSyntax(s, input);
    }
    for (const t of node.findDirectExpressions(Expressions.Target)) {
      Target.runSyntax(t, input);
    }
  }
}