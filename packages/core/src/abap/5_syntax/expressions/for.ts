import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {InlineFieldDefinition} from "./inline_field_definition";
import {Source} from "./source";

export class For {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {

    for (const f of node.findAllExpressions(Expressions.InlineFieldDefinition)) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}