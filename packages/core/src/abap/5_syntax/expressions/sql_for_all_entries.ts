import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {VoidType, TableType} from "../../types/basic";

export class SQLForAllEntries {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {
    const s = node.findFirstExpression(Expressions.Source);
    if (s) {
      const type = new Source().runSyntax(s, scope, filename);
      if (type instanceof VoidType) {
        return;
      }
      if (!(type instanceof TableType)) {
        throw new Error("FAE parameter must be table type");
      }

      const name = s.concatTokens();
      scope.setAllowHeaderUse(name);
    }
  }

}