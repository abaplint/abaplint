import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineFieldDefinition} from "./inline_field_definition";
import {Source} from "./source";
import {InlineLoopDefinition} from "./inline_loop_definition";

export class For {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.InlineLoopDefinition)) {
      new InlineLoopDefinition().runSyntax(s, scope, filename);
    }

    for (const f of node.findAllExpressions(Expressions.InlineFieldDefinition)) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}