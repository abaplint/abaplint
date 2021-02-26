import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";
import {Source} from "../expressions/source";

export class Perform {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    if (!(node.get() instanceof Statements.Perform)) {
      throw new Error("checkPerform unexpected node type");
    }

    ////////////////////////////
    // check parameters are defined

    for (const c of node.findDirectExpressions(Expressions.PerformChanging)) {
      for (const s of c.findDirectExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename);
      }
    }
    for (const t of node.findDirectExpressions(Expressions.PerformTables)) {
      for (const s of t.findDirectExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename);
      }
    }
    for (const u of node.findDirectExpressions(Expressions.PerformUsing)) {
      for (const s of u.findDirectExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename);
      }
    }

    ////////////////////////////
    // find FORM definition

    if (node.findFirstExpression(Expressions.IncludeName)) {
      return; // in external program, not checked, todo
    }

    if (node.findFirstExpression(Expressions.Dynamic)) {
      return; // todo, maybe some parts can be checked
    }

    const expr = node.findFirstExpression(Expressions.FormName);
    if (expr === undefined) {
      return; // it might be a dynamic call
    }

    const name = expr.concatTokens();

    const found = scope.findFormDefinition(name);
    if (found === undefined) {
      throw new Error("FORM definition \"" + name + "\" not found");
    }

    scope.addReference(expr.getFirstToken(), found, ReferenceType.FormReference, filename);

    // todo, also check parameters match
  }
}