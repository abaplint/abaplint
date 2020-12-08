import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class FieldAssignment {

  public runSyntax(
    node: ExpressionNode | StatementNode,
    scope: CurrentScope,
    filename: string,
    _targetType: AbstractType | undefined): void {

    const name = node.findDirectExpression(Expressions.FieldSub)?.concatTokens();
    if (name === undefined) {
      throw new Error("FieldAssignment, FieldSub node not found");
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      throw new Error("FieldAssignment, Source node not found");
    }

    new Source().runSyntax(s, scope, filename);
  }

}