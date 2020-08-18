import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {InlineFieldDefinition} from "./inline_field_definition";

export class Let {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string) {
    if (node === undefined) {
      return;
    }

    for (const f of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }
  }
}