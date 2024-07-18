import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Receive implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // todo, lots of work here, similar to call_function.ts

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, input);
    }

  }
}