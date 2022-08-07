import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {StructureType, TableType} from "../../types/basic";

export class TypeTableKey {
  public runSyntax(node: ExpressionNode, type: AbstractType) {
    if (type instanceof TableType) {
      const rowType = type.getRowType();
      if (rowType instanceof StructureType) {
        for (const c of node.findAllExpressions(Expressions.FieldSub)) {
          if (rowType.getComponentByName(c.concatTokens()) === undefined) {
            throw new Error(`Field ${c.concatTokens()} not part of structure`);
          }
        }
      }
    }
  }
}