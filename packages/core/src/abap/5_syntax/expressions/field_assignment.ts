import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {StructureType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class FieldAssignment {

  public runSyntax(
    node: ExpressionNode | StatementNode,
    scope: CurrentScope,
    filename: string,
    targetType: AbstractType | undefined): void {

    const name = node.findDirectExpression(Expressions.FieldSub)?.concatTokens();
    if (name === undefined) {
      throw new Error("FieldAssignment, FieldSub node not found");
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      throw new Error("FieldAssignment, Source node not found");
    }

    let type: AbstractType | undefined = undefined;
    if (targetType instanceof StructureType) {
      type = targetType.getComponentByName(name);
      if (type === undefined && targetType.containsVoid() === false) {
        throw new Error(`field ${name} does not exist in structure`);
      }
    } else if (targetType instanceof VoidType) {
      type = targetType;
    }

    new Source().runSyntax(s, scope, filename, type);
  }

}