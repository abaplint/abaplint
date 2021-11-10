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

    const fieldSub = node.findDirectExpression(Expressions.FieldSub);
    if (fieldSub === undefined) {
      throw new Error("FieldAssignment, FieldSub node not found");
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      throw new Error("FieldAssignment, Source node not found");
    }

    let type: AbstractType | undefined = undefined;
    if (targetType instanceof StructureType) {
      let context: AbstractType | undefined = targetType;
      for (const c of fieldSub.getChildren()) {
        const text = c.concatTokens();
        if (text !== "-" && context instanceof StructureType) {
          context = context.getComponentByName(text);
          if (context === undefined && targetType.containsVoid() === false) {
            throw new Error(`field ${text} does not exist in structure`);
          }
        }
      }
      type = context;
    } else if (targetType instanceof VoidType) {
      type = targetType;
    }

    new Source().runSyntax(s, scope, filename, type);
  }

}