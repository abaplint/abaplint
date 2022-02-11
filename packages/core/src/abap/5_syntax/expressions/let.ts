import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {InlineFieldDefinition} from "./inline_field_definition";
import {ScopeType} from "../_scope_type";

export class Let {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): boolean {
    if (node === undefined) {
      return false;
    }

    scope.push(ScopeType.Let, "LET", node.getFirstToken().getStart(), filename);

    for (const f of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }

    return true;
  }
}