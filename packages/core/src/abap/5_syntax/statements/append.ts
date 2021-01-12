import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {TableType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {FSTarget} from "../expressions/fstarget";

export class Append {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    let targetType: AbstractType | undefined = undefined;

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      targetType = new Target().runSyntax(target, scope, filename);
    }

    const fsTarget = node.findExpressionAfterToken("ASSIGNING");
    if (fsTarget && fsTarget.get() instanceof Expressions.FSTarget) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType)) {
        throw new Error("APPEND to non table type");
      }

      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;

      new FSTarget().runSyntax(fsTarget, scope, filename, rowType);
    }

    let source = node.findDirectExpression(Expressions.Source);
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.ConstantOrFieldSource);
    }
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.MethodCallChain);
    }
    if (source) {
      if (targetType !== undefined
          && !(targetType instanceof TableType)
          && !(targetType instanceof VoidType)) {
        throw new Error("Append, target not a table type");
      }
      let rowType: AbstractType | undefined = undefined;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      } else if (targetType instanceof VoidType) {
        rowType = targetType;
      }
      new Source().runSyntax(source, scope, filename, rowType);
    }

    const from = node.findExpressionAfterToken("FROM");
    if (from && from.get() instanceof Expressions.Source) {
      new Source().runSyntax(from, scope, filename);
    }
    const to = node.findExpressionAfterToken("TO");
    if (to && to.get() instanceof Expressions.Source) {
      new Source().runSyntax(to, scope, filename);
    }

  }
}