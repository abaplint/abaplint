import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType} from "../../types/basic";
import {InlineData} from "./inline_data";
import {Target} from "./target";
import {SQLFrom} from "./sql_from";
import {Source} from "./source";
import {SQLForAllEntries} from "./sql_for_all_entries";
import {ScopeType} from "../_scope_type";

export class Select {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {
    const token = node.getFirstToken();

    const from = node.findDirectExpression(Expressions.SQLFrom);
    if (from) {
      new SQLFrom().runSyntax(from, scope, filename);
    }

    const inline = node.findFirstExpression(Expressions.InlineData);
    if (inline) {
      // todo, for now these are voided
      new InlineData().runSyntax(inline, scope, filename, new VoidType("SELECT_todo"));
    }

    const fae = node.findDirectExpression(Expressions.SQLForAllEntries);
    if (fae) {
      scope.push(ScopeType.OpenSQL, "SELECT", token.getStart(), filename);
      new SQLForAllEntries().runSyntax(fae, scope, filename);
    }

    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }
    // check implicit into, the target field is implict equal to the table name
    if (node.findDirectExpression(Expressions.SQLIntoTable) === undefined
        && node.findDirectExpression(Expressions.SQLIntoStructure) === undefined) {
      const fields = node.findFirstExpression(Expressions.SQLAggregation)?.concatTokens();
      const c = new RegExp(/^count\(\s*\*\s*\)$/, "i");
      if (fields === undefined || c.test(fields) === false) {
        const name = from?.findDirectExpression(Expressions.SQLFromSource)?.concatTokens();
        if (name && scope.findVariable(name) === undefined) {
          throw new Error(`Target variable ${name} not found in scope`);
        }
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    if (scope.getType() === ScopeType.OpenSQL) {
      scope.pop(node.getLastToken().getEnd());
    }
  }
}