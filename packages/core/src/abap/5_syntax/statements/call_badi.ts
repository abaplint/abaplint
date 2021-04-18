import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";

export class CallBadi implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

  }
}