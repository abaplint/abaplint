import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCond} from "../expressions/component_cond";
import {AnyType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";

export class ModifyInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    // there is only one
    const target = node.findFirstExpression(Expressions.Target);
    const targetExpression = target;
    if (targetExpression) {
      // it might be a dynamic target
      const targetType = new Target().runSyntax(targetExpression, scope, filename);
      if (targetType instanceof VoidType
          || targetType instanceof AnyType
          || targetType instanceof UnknownType) {
        // ok
      } else if (targetType instanceof TableType) {
        if (node.findDirectTokenByText("TABLE")
            && node.findDirectTokenByText("INDEX")
            && targetType.isWithHeader() === false) {
          // MODIFY TABLE INDEX
          throw new Error("Table does not have header line");
        }
      } else if (targetType instanceof StructureType) {
        // it might originate from a TABLES statement
        if (target.concatTokens().toUpperCase() !== targetType.getDDICName()) {
          throw new Error("Not an internal table");
        }
      } else {
        throw new Error("Not an internal table");
      }
    }

    const fstarget = node.findDirectExpression(Expressions.FSTarget);
    if (fstarget) {
      new FSTarget().runSyntax(fstarget, scope, filename, undefined);
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCond)) {
      new ComponentCond().runSyntax(t, scope, filename);
    }

  }
}