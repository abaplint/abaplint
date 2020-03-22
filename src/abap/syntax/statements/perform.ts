import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";

export class Perform {
  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): void {
    if (!(node.get() instanceof Statements.Perform)) {
      throw new Error("checkPerform unexpected node type");
    }

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

    const name = expr.getFirstToken().getStr();

// todo, also check parameters match
    if (scope.findFormDefinition(name) === undefined) {
      throw new Error("FORM definition \"" + name + "\" not found");
    }
  }
}