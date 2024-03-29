import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";
import {IntegerType} from "../../types/basic";

export class Do implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const afterDo = node.findExpressionAfterToken("DO");

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const type = new Source().runSyntax(s, scope, filename);
      if (s === afterDo
          && new TypeUtils(scope).isAssignable(type, IntegerType.get()) === false) {
        throw new Error("DO TIMES must be numeric");
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }
  }
}