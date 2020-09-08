import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Target} from "../expressions/target";

export class Condense {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }

  }
}