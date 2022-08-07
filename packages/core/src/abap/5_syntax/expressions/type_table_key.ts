import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {StructureType, TableType, UnknownType} from "../../types/basic";

export class TypeTableKey {
  public runSyntax(node: ExpressionNode, type: AbstractType) {
    if (type instanceof TableType) {
      const rowType = type.getRowType();
      if (rowType instanceof StructureType) {
        for (const c of node.findAllExpressions(Expressions.FieldSub)) {
          const concat = c.concatTokens();
          if (concat.includes("-") === false // todo, properly check sub fields
              && rowType.getComponentByName(concat) === undefined
              && concat.toUpperCase() !== "TABLE_LINE") {
            return new UnknownType(`Field ${concat} not part of structure`);
          }
        }
      }
    }
    return undefined;
  }
}