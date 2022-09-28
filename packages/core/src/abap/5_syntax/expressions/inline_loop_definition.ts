import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {IntegerType, TableType, UnknownType, VoidType} from "../../types/basic";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";

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
      let rowType: AbstractType | undefined = undefined;
      if (sourceType instanceof TableType) {
        rowType = sourceType.getRowType();
      } else if (sourceType instanceof VoidType) {
        rowType = sourceType;
      } else if (sourceType instanceof UnknownType) {
        throw new Error("Unknown type, " + sourceType.getError());
      }
      if (rowType === undefined
          && node.concatTokens().toUpperCase().includes(" IN GROUP ")
          && sourceType !== undefined) {
        rowType = sourceType;
      } else if (rowType === undefined) {
        throw new Error("InlineLoopDefinition, not a table type");
      }
      const identifier = new TypedIdentifier(target.getFirstToken(), filename, rowType, [IdentifierMeta.InlineDefinition]);
      scope.addReference(target.getFirstToken(), identifier, ReferenceType.DataWriteReference, filename);
      scope.addReference(target.getFirstToken(), identifier, ReferenceType.DataReadReference, filename);
      scope.addIdentifier(identifier);
    }

    const index = node.findExpressionAfterToken("INTO");
    if (index && index.get() instanceof Expressions.TargetField) {
      const identifier = new TypedIdentifier(index.getFirstToken(), filename, new IntegerType(), [IdentifierMeta.InlineDefinition]);
      scope.addReference(index.getFirstToken(), identifier, ReferenceType.DataWriteReference, filename);
      scope.addIdentifier(identifier);
    }

  }
}