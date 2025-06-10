import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Transfer implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const source of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(source, input);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      Target.runSyntax(target, input);
    }
  }
}