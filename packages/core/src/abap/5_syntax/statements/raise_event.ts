import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";

export class RaiseEvent implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
// todo: only possible in classes

    const f = node.findDirectExpression(Expressions.Field);
    if (f?.concatTokens().includes("~")) {
      const name = f.concatTokens().split("~")[0];
      const idef = scope.findInterfaceDefinition(name);
      if (idef) {
        scope.addReference(f.getFirstToken(), idef, ReferenceType.ObjectOrientedReference, filename);
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}