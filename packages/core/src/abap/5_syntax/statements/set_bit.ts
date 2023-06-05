import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";

export class SetBit implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const typ = new Target().runSyntax(t, scope, filename);
      if (typ && new TypeUtils(scope).isHexLike(typ) === false) {
        throw new Error("Input must be byte-like");
      }
    }
  }
}