import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Divide implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // both operands are converted into numbers, a reference cannot be
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const type = Source.runSyntax(s, input);
      if (Source.reportReferenceOperand(type, s, input)) {
        return;
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const type = Target.runSyntax(t, input);
      if (Source.reportReferenceOperand(type, t, input)) {
        return;
      }
    }

  }
}