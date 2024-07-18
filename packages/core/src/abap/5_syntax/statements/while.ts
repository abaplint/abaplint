import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Cond} from "../expressions/cond";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class While implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(s, input);
    }
  }
}