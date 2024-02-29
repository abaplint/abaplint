import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {DataReference, TableType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {FSTarget} from "../expressions/fstarget";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {TypeUtils} from "../_type_utils";

// todo: issue error for short APPEND if the source is without header line
export class Append implements StatementSyntax {
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

    const dataTarget = node.findExpressionAfterToken("INTO");
    if (dataTarget && node.concatTokens().toUpperCase().includes(" REFERENCE INTO DATA(")) {
      if (!(targetType instanceof TableType) && !(targetType instanceof VoidType)) {
        throw new Error("APPEND to non table type");
      }
      const rowType = targetType instanceof TableType ? targetType.getRowType() : targetType;
      new InlineData().runSyntax(dataTarget, scope, filename, new DataReference(rowType));
    }

    let source = node.findDirectExpression(Expressions.SimpleSource4);
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.Source);
    }
    if (source) {
      if (targetType !== undefined
          && !(targetType instanceof TableType)
          && dataTarget !== target
          && !(targetType instanceof VoidType)) {
        throw new Error("Append, target not a table type");
      }

      let rowType: AbstractType | undefined = undefined;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      } else if (targetType instanceof VoidType) {
        rowType = targetType;
      }
      const sourceType = new Source().runSyntax(source, scope, filename, rowType);

      if (node.findDirectTokenByText("LINES")) {
        if (new TypeUtils(scope).isAssignable(sourceType, targetType) === false) {
          throw new Error("Incompatible types");
        }
      } else {
        if (new TypeUtils(scope).isAssignable(sourceType, rowType) === false) {
          throw new Error("Incompatible types");
        }
      }
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