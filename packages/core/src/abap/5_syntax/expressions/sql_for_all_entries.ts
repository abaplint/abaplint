import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {VoidType, TableType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";

export class SQLForAllEntries {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {
    const s = node.findFirstExpression(Expressions.Source);
    if (s) {
      const token = s.getFirstToken();
      const type = new Source().runSyntax(s, scope, filename);
      if (type instanceof VoidType) {
        return;
      }
      if (!(type instanceof TableType)) {
        throw new Error("FAE parameter must be table type");
      }

      const id = new TypedIdentifier(token, filename, type.getRowType());
      scope.addIdentifier(id);
    }
  }

}