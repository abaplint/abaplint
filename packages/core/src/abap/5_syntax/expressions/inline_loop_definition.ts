import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {TableType} from "../../types/basic";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";

export class InlineLoopDefinition {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): void {
    if (node === undefined) {
      return;
    }

    let target = node.findDirectExpression(Expressions.TargetField);
    if (target === undefined) {
      target = node.findDirectExpression(Expressions.TargetFieldSymbol);
    }
    const source = node.findDirectExpression(Expressions.Source);

    if (source && target) {
      const sourceType = new Source().runSyntax(source, scope, filename);
      if (!(sourceType instanceof TableType)) {
        throw new Error("InlineLoopDefinition, not a table type");
      }
      const identifier = new TypedIdentifier(target.getFirstToken(), filename, sourceType.getRowType(), [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
    }

  }
}