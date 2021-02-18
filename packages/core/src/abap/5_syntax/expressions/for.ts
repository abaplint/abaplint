import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineFieldDefinition} from "./inline_field_definition";
import {Source} from "./source";
import {InlineLoopDefinition} from "./inline_loop_definition";
import {ScopeType} from "../_scope_type";

export class For {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {

    const inlineLoop = node.findDirectExpressions(Expressions.InlineLoopDefinition);
    const inlineField = node.findAllExpressions(Expressions.InlineFieldDefinition);
    const addScope = inlineLoop.length > 0 || inlineField.length > 0;
    if (addScope) {
      scope.push(ScopeType.For, "FOR", node.getFirstToken().getStart(), filename);
    }

    for (const s of inlineLoop) {
      new InlineLoopDefinition().runSyntax(s, scope, filename);
    }

    for (const f of inlineField) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    /*
    if (addScope) {
      scope.pop(node.getLastToken().getEnd());
    }
    */
  }
}